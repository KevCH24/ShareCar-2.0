#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, Map, Vec, Val, IntoVal, symbol_short, token};

// Keys
const VEHICLES_KEY: Symbol = symbol_short!("VEHICLES");
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const ORDER_ID_COUNTER: &str = "order_id_counter";
const ORDERS_KEY: &str = "orders";
const RESERVATIONS_KEY: &str = "reserves";
const TOKEN_KEY: &str = "token"; // Token Address for Payments (XLM)

#[contract]
pub struct ShareCar;

#[contractimpl]
impl ShareCar {
    // Initialize with Admin and Token Address (testnet XLM or Native)
    pub fn initialize(env: Env, admin: Address, token: Address) {
        if env.storage().persistent().has(&ADMIN_KEY) {
            panic!("Contract already initialized");
        }
        env.storage().persistent().set(&ADMIN_KEY, &admin);
        env.storage().persistent().set(&TOKEN_KEY, &token);
        env.storage().persistent().set(&ORDER_ID_COUNTER, &0u32);
    }

    fn check_admin(env: &Env) {
        let admin: Address = env.storage().persistent().get(&ADMIN_KEY).expect("Not initialized");
        admin.require_auth();
    }

    // --- VEHICLE MANAGEMENT ---

    // Publish Vehicle: Brand, Model, Rate (Stroops/hour or Unit), Image/Desc
    pub fn publish_vehicle(env: Env, model: String, brand: String, availability: String, rate: i128) {
        Self::check_admin(&env);
        let mut vehicles = Self::get_vehicles(&env);

        let mut data = Vec::new(&env);
        data.push_back(brand.into_val(&env));
        data.push_back(availability.into_val(&env));
        data.push_back(rate.into_val(&env)); // Rate in Stroops (1 XLM = 10,000,000 Stroops)
        data.push_back(1_i128.into_val(&env)); // Stock/Available

        vehicles.set(model, data);
        env.storage().persistent().set(&VEHICLES_KEY, &vehicles);
    }

    pub fn get_vehicle(env: Env, model: String) -> Vec<Val> {
        Self::get_vehicles(&env).get(model).unwrap_or(Vec::new(&env))
    }

    pub fn list_vehicles(env: Env) -> Vec<String> {
        let vehicles = Self::get_vehicles(&env);
        let mut list = Vec::new(&env);
        for key in vehicles.keys() {
            list.push_back(key);
        }
        list
    }

    fn get_vehicles(env: &Env) -> Map<String, Vec<Val>> {
        env.storage().persistent().get(&VEHICLES_KEY).unwrap_or(Map::new(env))
    }

    // --- RESERVATIONS & PAYMENTS ---

    // Reserve a vehicle by paying the rate
    // `user` must have approved this contract to spend tokens if using transfer_from
    pub fn reserve_vehicle(env: Env, user: Address, model: String) -> u32 {
        user.require_auth();
        
        // 1. Get Vehicle Details
        let vehicles = Self::get_vehicles(&env);
        if !vehicles.contains_key(model.clone()) {
            panic!("Vehicle not found");
        }
        let v_data = vehicles.get(model.clone()).unwrap();
        // v_data: [Brand, Availability, Rate, Stock]
        // Index 2 is Rate
        let rate: i128 = v_data.get(2).unwrap().into_val(&env);

        // 2. Process Payment
        // Transfer 'rate' from 'user' to 'contract' (or admin)
        // We will send to Admin for simplicity of MVP
        let token_addr: Address = env.storage().persistent().get(&TOKEN_KEY).expect("Token not set");
        let admin: Address = env.storage().persistent().get(&ADMIN_KEY).expect("Admin not set");
        
        let client = token::Client::new(&env, &token_addr);
        
        // Transfer from User -> Admin
        // User must authorize this call, which they do by signing transaction invoking this function
        // BUT for transfer_from to work, user must approve contract OR we just use transfer if the caller is the user?
        // In Soroban, if 'user' is the caller and invokes this, we can't force a transfer unless we are the token admin or have allowance.
        // EASIER MVP PATTERN: Just use `transfer` from `user` to `admin`? 
        // No, the contract can calls `transfer_from` if it has allowance. 
        // If we want a singe-step info, we use the `transfer` approach but we can't make the user transfer inside the contract call unless it's `transfer_from`.
        // Standard pattern: User `approve` contract -> User call `reserve`.
        
        // EASIER MVP PATTERN: Use `transfer` from `user` to `admin`
        // The `user` must authorize this call. Since `user` is invoking `reserve_vehicle`, 
        // the auth tree will include this transfer invocation.
        client.transfer(&user, &admin, &rate);

        // 3. Create Reservation Record
        let mut counter: u32 = env.storage().persistent().get(&ORDER_ID_COUNTER).unwrap_or(0);
        counter += 1;
        env.storage().persistent().set(&ORDER_ID_COUNTER, &counter);

        let mut reservations: Map<u32, Vec<Val>> = env.storage().persistent().get(&RESERVATIONS_KEY).unwrap_or(Map::new(&env));
        
        let mut details = Vec::new(&env);
        details.push_back(user.into_val(&env));
        details.push_back(model.into_val(&env));
        details.push_back(rate.into_val(&env));
        
        reservations.set(counter, details);
        env.storage().persistent().set(&RESERVATIONS_KEY, &reservations);

        counter
    }
}
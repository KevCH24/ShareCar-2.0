#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, Map, Vec, Val, IntoVal, symbol_short};

// Keys
const VEHICLES_KEY: Symbol = symbol_short!("VEHICLES");
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const ORDER_ID_COUNTER: &str = "order_id_counter";
const ORDERS_KEY: &str = "orders";
const ORDER_STATUSES: &str = "order_statuses";

// Order Statuses
const CREATED: &str = "creado";
const CONFIRMED: &str = "confirmado";
const ACTIVE: &str = "en_curso";
const COMPLETED: &str = "finalizado";
const CANCELLED: &str = "cancelado";

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().persistent().has(&ADMIN_KEY) {
            panic!("Contract already initialized");
        }
        env.storage().persistent().set(&ADMIN_KEY, &admin);
        env.storage().persistent().set(&ORDER_ID_COUNTER, &0u32);
        
        let mut statuses = Vec::new(&env);
        statuses.push_back(String::from_str(&env, CREATED));
        statuses.push_back(String::from_str(&env, CONFIRMED));
        statuses.push_back(String::from_str(&env, ACTIVE));
        statuses.push_back(String::from_str(&env, COMPLETED));
        statuses.push_back(String::from_str(&env, CANCELLED));
        env.storage().persistent().set(&ORDER_STATUSES, &statuses);
    }

    fn check_admin(env: &Env) {
        let admin: Address = env.storage().persistent().get(&ADMIN_KEY).expect("Not initialized");
        admin.require_auth();
    }

    // --- VEHICLE MANAGEMENT ---

    // Data structure: [Brand, Availability(String), Rate(i32), Stock(i32)]
    // Key: Model(String)
    
    pub fn publish_vehicle(env: Env, model: String, brand: String, availability: String, rate: i32) {
        Self::check_admin(&env);
        let mut vehicles = Self::get_vehicles(&env);

        let mut data = Vec::new(&env);
        data.push_back(brand.into_val(&env));
        data.push_back(availability.into_val(&env));
        data.push_back(rate.into_val(&env));
        data.push_back(1_i32.into_val(&env)); // Default stock 1 for P2P sharing

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

    // --- RESERVATIONS ---

    pub fn create_reservation(env: Env, vehicle_model: String) -> u32 {
        let mut counter: u32 = env.storage().persistent().get(&ORDER_ID_COUNTER).unwrap_or(0);
        counter += 1;
        env.storage().persistent().set(&ORDER_ID_COUNTER, &counter);

        let mut orders: Map<u32, Vec<String>> = env.storage().persistent().get(&ORDERS_KEY).unwrap_or(Map::new(&env));
        let mut details = Vec::new(&env);
        details.push_back(vehicle_model); 
        orders.set(counter, details);

        env.storage().persistent().set(&ORDERS_KEY, &orders);
        counter
    }

    pub fn get_reservation(env: Env, id: u32) -> Vec<String> {
        let orders: Map<u32, Vec<String>> = env.storage().persistent().get(&ORDERS_KEY).unwrap_or(Map::new(&env));
        orders.get(id).unwrap_or(Vec::new(&env))
    }
}
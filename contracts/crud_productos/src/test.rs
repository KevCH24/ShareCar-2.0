#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address, String, Vec};

    #[test]
    fn test_initialize_and_admin() {
        let env = Env::default();
        let admin = Address::random(&env);

        // Inicializar el contrato
        Contract::initialize(env.clone(), admin.clone());

        // Verificar que el administrador se estableció correctamente
        let stored_admin = Contract::get_admin(&env);
        assert_eq!(stored_admin, admin);
    }

    #[test]
    fn test_add_and_get_product() {
        let env = Env::default();
        let admin = Address::random(&env);
        Contract::initialize(env.clone(), admin.clone());

        // Establecer el entorno para que actúe como el administrador
        env.set_source_account(&admin);

        let product_name = String::from_str(&env, "Producto1");
        let quantity = 10;
        let price = 100;

        // Agregar un producto
        Contract::add_product(env.clone(), product_name.clone(), quantity, price);

        // Obtener el producto y verificar sus valores
        let product_data = Contract::get_product(env.clone(), product_name.clone());
        assert_eq!(product_data.len(), 2);
        assert_eq!(product_data.get(0).unwrap().try_into::<i32>().unwrap(), quantity);
        assert_eq!(product_data.get(1).unwrap().try_into::<i32>().unwrap(), price);
    }

    #[test]
    fn test_create_and_get_order() {
        let env = Env::default();
        let admin = Address::random(&env);
        Contract::initialize(env.clone(), admin.clone());

        // Establecer el entorno para que actúe como el administrador
        env.set_source_account(&admin);

        let product_name = String::from_str(&env, "Producto1");
        let quantity = 10;
        let price = 100;

        // Agregar un producto
        Contract::add_product(env.clone(), product_name.clone(), quantity, price);

        // Crear una orden con el producto
        let products = Vec::from_array(&env, [product_name.clone()]);
        let order_id = Contract::create_order(env.clone(), products.clone());

        // Obtener la orden y verificar sus valores
        let order_data = Contract::get_order(env.clone(), order_id);
        assert_eq!(order_data.len(), 1);
        assert_eq!(order_data.get(0).unwrap().try_into::<String>().unwrap(), product_name);
    }

    #[test]
    fn test_update_order_status() {
        let env = Env::default();
        let admin = Address::random(&env);
        Contract::initialize(env.clone(), admin.clone());

        // Establecer el entorno para que actúe como el administrador
        env.set_source_account(&admin);

        let product_name = String::from_str(&env, "Producto1");
        let quantity = 10;
        let price = 100;

        // Agregar un producto
        Contract::add_product(env.clone(), product_name.clone(), quantity, price);

        // Crear una orden con el producto
        let products = Vec::from_array(&env, [product_name.clone()]);
        let order_id = Contract::create_order(env.clone(), products.clone());

        // Actualizar el estado de la orden
        let new_status = String::from_str(&env, "preparando");
        Contract::update_order_status(env.clone(), order_id, new_status.clone());

        // Obtener la orden y verificar el nuevo estado
        let order_data = Contract::get_order(env.clone(), order_id);
        assert_eq!(order_data.len(), 2);
        assert_eq!(order_data.get(1).unwrap().try_into::<String>().unwrap(), new_status);
    }

    #[test]
    fn test_list_orders() {
        let env = Env::default();
        let admin = Address::random(&env);
        Contract::initialize(env.clone(), admin.clone());

        // Establecer el entorno para que actúe como el administrador
        env.set_source_account(&admin);

        let product_name = String::from_str(&env, "Producto1");
        let quantity = 10;
        let price = 100;

        // Agregar un producto
        Contract::add_product(env.clone(), product_name.clone(), quantity, price);

        // Crear dos órdenes con el producto
        let products = Vec::from_array(&env, [product_name.clone()]);
        let order_id1 = Contract::create_order(env.clone(), products.clone());
        let order_id2 = Contract::create_order(env.clone(), products.clone());

        // Listar órdenes y verificar que ambas estén presentes
        let orders = Contract::list_orders(env.clone());
        assert_eq!(orders.len(), 2);
        assert!(orders.contains(&order_id1));
        assert!(orders.contains(&order_id2));
    }
}
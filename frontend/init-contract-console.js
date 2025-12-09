// Función para inicializar el contrato desde la consola del navegador
// Copia y pega este código completo en la consola de http://localhost:5173/

async function initializeShareCarContract() {
    console.log("🚀 Iniciando proceso de inicialización...");

    try {
        // Importar módulos necesarios
        const { Client: ContractClient, networks } = await import('./src/bindings/src/index.js');
        const freighter = await import('@stellar/freighter-api');

        console.log("✅ Módulos importados correctamente");

        // 1. Verificar Freighter
        const connected = await freighter.isConnected();
        if (!connected) {
            console.error("❌ Freighter no está instalado o no está conectado.");
            return;
        }
        console.log("✅ Freighter conectado");

        // 2. Obtener acceso
        console.log("🔑 Solicitando acceso a la cuenta...");
        const access = await freighter.requestAccess();
        const address = typeof access === "string" ? access : access.address;
        console.log(`✅ Cuenta conectada: ${address}`);

        // 3. Obtener red
        const net = await freighter.getNetworkDetails();
        if (net.error) {
            console.error(`❌ Error al obtener la red: ${net.error}`);
            return;
        }

        const rpcUrl = net.sorobanRpcUrl ?? "https://soroban-testnet.stellar.org";
        console.log(`🌐 Red: Testnet`);
        console.log(`🔗 RPC URL: ${rpcUrl}`);

        // 4. Crear cliente
        const client = new ContractClient({
            contractId: networks.testnet.contractId,
            networkPassphrase: networks.testnet.networkPassphrase,
            rpcUrl,
            publicKey: address,
            signTransaction: freighter.signTransaction,
        });

        console.log(`📋 Contract ID: ${networks.testnet.contractId}`);

        // 5. Inicializar
        console.log("📝 Preparando transacción de inicialización...");
        const tx = await client.initialize({ admin: address });

        console.log("🔍 Simulando transacción...");
        await tx.simulate();
        console.log("✅ Simulación exitosa");

        console.log("🖊️  Firmando y enviando transacción...");
        console.log("⚠️  Por favor, aprueba la transacción en Freighter");

        const sent = await tx.signAndSend();

        console.log("🎉 ============================================");
        console.log("✅ ¡CONTRATO INICIALIZADO EXITOSAMENTE!");
        console.log("🎉 ============================================");
        console.log(`📋 Transaction Hash: ${sent.hash || "N/A"}`);
        console.log(`👤 Admin: ${address}`);
        console.log("============================================");
        console.log("");
        console.log("✅ Ahora puedes hacer reservas de vehículos!");
        console.log("🚗 Recarga la página y prueba reservar un vehículo");

        return sent;

    } catch (error) {
        console.error("❌ Error al inicializar el contrato:");
        console.error(error);

        if (error.message && error.message.includes("already initialized")) {
            console.log("");
            console.log("ℹ️  El contrato ya está inicializado.");
            console.log("✅ Puedes proceder a hacer reservas.");
        }
    }
}

// Ejecutar la función
console.log("📌 Ejecutando initializeShareCarContract()...");
initializeShareCarContract();

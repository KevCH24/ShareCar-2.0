// Script para inicializar el contrato de ShareCar
import { Client as ContractClient, networks } from "./src/bindings/src/index.js";
import {
    isConnected,
    requestAccess,
    getNetworkDetails,
    signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";

async function initializeContract() {
    console.log("🚀 Inicializando contrato de ShareCar...");

    // 1. Verificar que Freighter esté conectado
    const connected = await isConnected();
    if (!connected) {
        console.error("❌ Freighter no está instalado o no está conectado.");
        console.log("Por favor, instala Freighter y recarga la página.");
        return;
    }

    // 2. Obtener acceso a la cuenta
    const access = await requestAccess();
    const address = typeof access === "string" ? access : access.address;
    console.log(`✅ Cuenta conectada: ${address}`);

    // 3. Obtener detalles de la red
    const net = await getNetworkDetails();
    if (net.error) {
        console.error(`❌ Error al obtener la red: ${net.error}`);
        return;
    }

    const rpcUrl = net.sorobanRpcUrl ?? "https://soroban-testnet.stellar.org";
    console.log(`🌐 Red: ${net.networkPassphrase}`);
    console.log(`🔗 RPC URL: ${rpcUrl}`);

    // 4. Crear cliente del contrato
    const client = new ContractClient({
        contractId: networks.testnet.contractId,
        networkPassphrase: networks.testnet.networkPassphrase,
        rpcUrl,
        publicKey: address,
        signTransaction: freighterSignTransaction,
    });

    console.log(`📋 Contract ID: ${networks.testnet.contractId}`);

    try {
        // 5. Inicializar el contrato
        console.log("📝 Preparando transacción de inicialización...");
        const tx = await client.initialize({ admin: address });

        console.log("🔍 Simulando transacción...");
        const sim = await tx.simulate();
        console.log("Resultado de simulación:", sim);

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
        console.log("🚗 Ve a http://localhost:5173/ y prueba reservar un vehículo");

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

// Ejecutar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    window.initializeShareCarContract = initializeContract;
    console.log("📌 Para inicializar el contrato, ejecuta: initializeShareCarContract()");
} else {
    initializeContract();
}

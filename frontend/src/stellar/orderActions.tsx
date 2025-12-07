// src/stellar/orderActions.ts
import { Client as ContractClient, networks } from "../bindings/src/index"; // o el nombre de tu binding
import {
  isConnected,
  requestAccess,
  getNetworkDetails,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";

// 🚩 Cliente firmado para operaciones sobre pedidos (create + update_status)
async function getSignedClientForOrders() {
  const connected = await isConnected();
  if (!connected) {
    throw new Error("Freighter no está instalado o no está conectado.");
  }

  const access = await requestAccess();
  const address =
    typeof access === "string" ? access : access.address;

  const net = await getNetworkDetails();
  if (net.error) {
    throw new Error(`Error al obtener la red desde Freighter: ${net.error}`);
  }

  const rpcUrl = net.sorobanRpcUrl ?? "https://soroban-testnet.stellar.org";

  const client = new ContractClient({
    contractId: networks.testnet.contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl,
    publicKey: address,
    signTransaction: freighterSignTransaction as SignTransaction,
  });

  return client;
}

// Ya lo tenías:
export async function createOrderForProducts(
  productNames: string[]
): Promise<number> {
  const client = await getSignedClientForOrders();
  const tx = await client.create_order({ products: productNames });

  // Explicit simulation log for demo purposes
  console.log("Simulating transaction...");
  const sim = await tx.simulate();
  console.log("Simulation result:", sim);

  const sent = await tx.signAndSend();
  return sent.result as unknown as number;
}

// 👇 NUEVO: cambiar estado del pedido
export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<void> {
  const client = await getSignedClientForOrders();
  const tx = await client.update_order_status({
    order_id: orderId,
    status,
  });
  await tx.signAndSend();
}

import { Client, networks } from "../bindings/src/index";
import {
  isConnected,
  requestAccess,
  getNetworkDetails,
  signTransaction,
} from "@stellar/freighter-api";

const TESTNET_RPC = "https://soroban-testnet.stellar.org";

export async function getShareCarClient() {
  const connected = await isConnected();
  if (!connected) {
    throw new Error("Freighter no está instalado o no está conectado.");
  }

  const access = await requestAccess();
  // @ts-ignore
  const address = typeof access === "string" ? access : access.address;
  if (!address) throw new Error("No se pudo obtener la dirección de la wallet.");

  const net = await getNetworkDetails();
  const rpcUrl = net.sorobanRpcUrl ?? TESTNET_RPC;

  return {
    address,
    client: new Client({
      contractId: "CDYP245VST5FPN6ARW7T7B4S7O77LITNG64WVV2343EBRRH2AOYYE2AB",
      networkPassphrase: networks.testnet.networkPassphrase,
      rpcUrl,
      // @ts-ignore
      publicKey: address,
      // @ts-ignore
      signTransaction,
    }),
  };
}

export async function reserveVehicle(model: string) {
  const { client, address } = await getShareCarClient();

  const tx = await client.reserve_vehicle({
    user: address,
    model,
  });

  const result = await tx.signAndSend();
  return result;
}

export async function publishVehicle(brand: string, model: string, availability: string, rate: number) {
  const { client } = await getShareCarClient();

  // Rate is int128 in bindings (BigInt). We accept number for simplicity.
  // 1 unit of rate. 
  const tx = await client.publish_vehicle({
    brand,
    model,
    availability,
    rate: BigInt(rate),
  });

  return await tx.signAndSend();
}

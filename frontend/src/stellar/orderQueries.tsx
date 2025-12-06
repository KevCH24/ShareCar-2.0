// src/stellar/orderQueries.ts
import { Client as ContractClient, networks } from "../bindings/src/index";

const SOROBAN_RPC = "https://soroban-testnet.stellar.org";

export type OrderStatus =
  | "creado"
  | "preparando"
  | "listo"
  | "entregado"
  | "cancelado"
  | "desconocido";

export interface Order {
  id: number;
  products: string[];
  status: OrderStatus;
}

// Client solo lectura (no firma, no Freighter)
function getReadOnlyClient() {
  return new ContractClient({
    contractId: networks.testnet.contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: SOROBAN_RPC,
  });
}

export async function fetchOrders(): Promise<Order[]> {
  const client = getReadOnlyClient();

  // 1) Obtener IDs de pedidos
  const txList = await client.list_orders();
  const ids = (txList.result ?? []) as number[];

  const knownStatuses = new Set<string>([
    "creado",
    "preparando",
    "listo",
    "entregado",
    "cancelado",
  ]);

  const orders: Order[] = [];

  for (const id of ids) {
    const txOrder = await client.get_order({ order_id: id });
    const data = (txOrder.result ?? []) as any[];

    if (data.length === 0) {
      orders.push({ id, products: [], status: "desconocido" });
      continue;
    }

    // Por diseño de tu contrato:
    // [prod1, prod2, ..., status?]
    let rawStatus: string | undefined;
    let products = data.map((v) => String(v));

    const last = String(data[data.length - 1]);
    if (knownStatuses.has(last)) {
      rawStatus = last;
      products = data.slice(0, -1).map((v) => String(v));
    }

    const status = (rawStatus as OrderStatus) ?? "desconocido";

    orders.push({
      id,
      products,
      status,
    });
  }

  return orders;
}

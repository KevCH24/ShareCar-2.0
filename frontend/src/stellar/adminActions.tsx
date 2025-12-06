// src/stellar/adminActions.ts
import { getTokenEatsClient } from "./client";

export async function addProductWithFreighter(
  name: string,
  quantity: number,
  price: number
) {
  const client = await getTokenEatsClient();

  // Construye la tx para el método add_product del contrato
  const assembledTx = await client.add_product({
    name,
    quantity,
    price,
  });

  // Simula + firma con Freighter + envía
  const sent = await assembledTx.signAndSend();

  return sent; // aquí podrías devolver sent.result si lo necesitas
}

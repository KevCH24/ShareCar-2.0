// @ts-nocheck
import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC3L662DI5UCCPUZ6JZAWDMGNHTVEP6OYOX3VT6Y5WT4CAGJQ3GZARPQ",
  }
} as const


export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, token}: {admin: string, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_vehicle: ({model}: {model: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<any>>>

  /**
   * Construct and simulate a list_vehicles transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  list_vehicles: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a publish_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  publish_vehicle: ({model, brand, availability, rate}: {model: string, brand: string, availability: string, rate: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a reserve_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reserve_vehicle: ({user, model}: {user: string, model: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAALZ2V0X3ZlaGljbGUAAAAAAQAAAAAAAAAFbW9kZWwAAAAAAAAQAAAAAQAAA+oAAAAA",
        "AAAAAAAAAAAAAAANbGlzdF92ZWhpY2xlcwAAAAAAAAAAAAABAAAD6gAAABA=",
        "AAAAAAAAAAAAAAAPcHVibGlzaF92ZWhpY2xlAAAAAAQAAAAAAAAABW1vZGVsAAAAAAAAEAAAAAAAAAAFYnJhbmQAAAAAAAAQAAAAAAAAAAxhdmFpbGFiaWxpdHkAAAAQAAAAAAAAAARyYXRlAAAACwAAAAA=",
        "AAAAAAAAAAAAAAAPcmVzZXJ2ZV92ZWhpY2xlAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAVtb2RlbAAAAAAAABAAAAABAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        get_vehicle: this.txFromJSON<Array<any>>,
        list_vehicles: this.txFromJSON<Array<string>>,
        publish_vehicle: this.txFromJSON<null>,
        reserve_vehicle: this.txFromJSON<u32>
  }
}
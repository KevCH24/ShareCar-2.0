
import {
    networks
} from "../bindings/src/index";
import {
    Keypair,
    TransactionBuilder,
    rpc,
    Contract,
    xdr,
    TimeoutInfinite
} from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDYP245VST5FPN6ARW7T7B4S7O77LITNG64WVV2343EBRRH2AOYYE2AB";

const VEHICLES = [
    { brand: "Toyota", model: "Corolla 2018", availability: "Lun-Dom 08:00-20:00", rate: 7 },
    { brand: "Tesla", model: "Model 3", availability: "Mar-Sab 09:00-18:00", rate: 18 },
    { brand: "BMW", model: "X3 2020", availability: "Lun-Vie 07:00-22:00", rate: 22 },
    { brand: "Ford", model: "Mustang GT", availability: "Sab-Dom 10:00-20:00", rate: 25 },
];

async function main() {
    console.log("Publishing Vehicles to ShareCar Contract...");

    try {
        // @ts-ignore
        const keypair = Keypair.fromSecret(process.env.ADMIN_SECRET);
        const adminKey = keypair.publicKey();
        console.log("Admin:", adminKey);

        const server = new rpc.Server("https://soroban-testnet.stellar.org");
        const contract = new Contract(CONTRACT_ID);

        // Send one transaction per vehicle because simulation often dislikes multi-op contract calls
        for (const v of VEHICLES) {
            console.log(`Adding ${v.brand} ${v.model}...`);
            const account = await server.getAccount(adminKey); // Refresh sequence

            const txBuilder = new TransactionBuilder(account, {
                fee: "10000",
                networkPassphrase: networks.testnet.networkPassphrase,
            });

            // publish_vehicle(model: String, brand: String, availability: String, rate: i128)
            const args = [
                xdr.ScVal.scvString(v.model),
                xdr.ScVal.scvString(v.brand),
                xdr.ScVal.scvString(v.availability),
                xdr.ScVal.scvI128(new xdr.Int128Parts({
                    lo: xdr.Uint64.fromString(v.rate.toString()),
                    hi: xdr.Int64.fromString("0")
                }))
            ];

            const op = contract.call("publish_vehicle", ...args);
            txBuilder.addOperation(op);

            const tx = txBuilder
                .setTimeout(TimeoutInfinite)
                .build();

            tx.sign(keypair);

            // Simulate
            const sim = await server.simulateTransaction(tx);
            if (rpc.Api.isSimulationError(sim)) {
                console.error(`Simulation Error for ${v.model}:`, sim);
                continue;
            }

            console.log(`Simulation Successful for ${v.model}. Sending...`);

            const preparedTransaction = await server.prepareTransaction(tx);
            preparedTransaction.sign(keypair);

            const res = await server.sendTransaction(preparedTransaction);

            if (res.status !== "PENDING") {
                console.error(`Failed to publish ${v.model}:`, res);
            } else {
                console.log(`Vehicle ${v.model} Published! Hash:`, res.hash);
            }

            // Wait to avoid sequence collisions or rate limits
            await new Promise(r => setTimeout(r, 2000));
        }

    } catch (e) {
        console.error("Publish Failed:", e);
    }
}

main();

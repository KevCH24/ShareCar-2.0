import {
    networks
} from "../bindings/src/index";
import {
    Keypair,
    TransactionBuilder,
    rpc, // Correct export
    Contract,
    xdr,
    StrKey,
    TimeoutInfinite
} from "@stellar/stellar-sdk";

// Admin Secret Key (will be replaced by actual key)
// const ADMIN_SECRET = "SD3..."; // Injected via env
const CONTRACT_ID = "CDYP245VST5FPN6ARW7T7B4S7O77LITNG64WVV2343EBRRH2AOYYE2AB"; // Corrected ID
const TOKEN_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

function createContractAddressScVal(contractId: string) {
    return xdr.ScVal.scvAddress(
        xdr.ScAddress.scAddressTypeContract(
            // @ts-ignore
            StrKey.decodeContract(contractId)
        )
    );
}

function createAccountAddressScVal(accountId: string) {
    return xdr.ScVal.scvAddress(
        xdr.ScAddress.scAddressTypeAccount(
            xdr.PublicKey.publicKeyTypeEd25519(
                StrKey.decodeEd25519PublicKey(accountId)
            )
        )
    );
}

async function main() {
    console.log("Initializing ShareCar Contract (Manual XDR)...");
    console.log("Contract:", CONTRACT_ID);
    console.log("Token:", TOKEN_ID);

    try {
        // @ts-ignore
        const keypair = Keypair.fromSecret(process.env.ADMIN_SECRET);
        const adminKey = keypair.publicKey();
        console.log("Admin:", adminKey);

        // Use rpc.Server
        const server = new rpc.Server("https://soroban-testnet.stellar.org");

        const account = await server.getAccount(adminKey);

        const contract = new Contract(CONTRACT_ID);

        // Manually build operation
        const args = [
            createAccountAddressScVal(adminKey),
            createContractAddressScVal(TOKEN_ID)
        ];

        const op = contract.call("initialize", ...args);

        const tx = new TransactionBuilder(account, {
            fee: "10000",
            networkPassphrase: networks.testnet.networkPassphrase,
        })
            .addOperation(op)
            .setTimeout(TimeoutInfinite)
            .build();

        tx.sign(keypair);

        // Simulate first
        const sim = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationError(sim)) {
            console.error("Simulation Error:", sim);
            return;
        }

        console.log("Simulation Successful. Assembling...");

        // Prepare transaction (restore footprint)
        const preparedTransaction = await server.prepareTransaction(tx);
        preparedTransaction.sign(keypair);

        const res = await server.sendTransaction(preparedTransaction);
        console.log("Sent:", res);

        if (res.status !== "PENDING") {
            console.error("Failed:", res);
        } else {
            console.log("Transaction Sent! Hash:", res.hash);
            console.log(`https://stellar.expert/explorer/testnet/tx/${res.hash}`);
        }

    } catch (e) {
        console.error("Initialization Failed:", e);
    }
}

main();

import express from "express";
import algosdk from "algosdk";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Replace with your mnemonic
const MNEMONIC = "echo jacket food young illness kite fiber rely copy drive pottery screen unfold subway boil human media wrong trumpet below civil typical custom abandon crazy";

const account = algosdk.mnemonicToSecretKey(MNEMONIC);

console.log("ACCOUNT:", account);
console.log("ADDRESS:", account.addr.toString());

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

// 📌 API: Store batch
app.post("/store-batch", async (req, res) => {
  try {
    const batch = req.body;

    

    const note = new Uint8Array(Buffer.from(JSON.stringify(batch)));

   const sender = algosdk.encodeAddress(account.addr.publicKey);

let params = await algodClient.getTransactionParams().do();
params.flatFee = true;
params.fee = 1000;

const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender: sender,
  receiver: sender,
  amount: 1000,
  note: note,
  suggestedParams: params,
});

    const signedTxn = txn.signTxn(account.sk);

    const txId = txn.txID().toString();

    await algodClient.sendRawTransaction(signedTxn).do();

    res.json({ txId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to store batch" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
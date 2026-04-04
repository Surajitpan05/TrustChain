import express from "express";
import algosdk from "algosdk";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Replace with your mnemonic

// const account = algosdk.mnemonicToSecretKey(MNEMONIC);

// console.log("ACCOUNT:", account);
// console.log("ADDRESS:", account.addr.toString());

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);
app.post("/prepare-txn", async (req, res) => {
  try {
    const { batch } = req.body;

    const params = await algodClient.getTransactionParams().do();
    params.flatFee = true;
    params.fee = 1000;

    const note = new Uint8Array(Buffer.from(JSON.stringify(batch)));

    // ⚠️ dummy address (will be replaced in frontend)
    // const dummy = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const { sender } = req.body;
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender: sender,
  receiver: sender,
  amount: 1000,
  note,
  suggestedParams: params,
});

    const encodedTxn = Buffer.from(
      algosdk.encodeUnsignedTransaction(txn)
    ).toString("base64");

    res.json({ txn: encodedTxn });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to prepare txn" });
  }
});
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
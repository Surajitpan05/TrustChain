import algosdk from "algosdk";
import PeraWalletConnect from "@perawallet/connect";

const peraWallet = new PeraWalletConnect();

async function sendTransaction(batch) {

  const accounts = await peraWallet.connect();
  const sender = accounts[0];

  const algodClient = new algosdk.Algodv2(
    "",
    "https://testnet-api.algonode.cloud",
    ""
  );

  const params = await algodClient.getTransactionParams().do();

  const note = new Uint8Array(Buffer.from(JSON.stringify(batch)));

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender,
    receiver: sender,
    amount: 1000,
    note,
    suggestedParams: params,
  });

  const txnsToSign = [{ txn, signers: [sender] }];

  const signedTxns = await peraWallet.signTransaction([txnsToSign]);

  const { txId } = await algodClient.sendRawTransaction(signedTxns).do();

  console.log("TX ID:", txId);
}
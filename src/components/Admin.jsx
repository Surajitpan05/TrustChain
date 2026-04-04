import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import { Buffer } from "buffer";

window.Buffer = Buffer;
window.global = window;
const peraWallet = new PeraWalletConnect();
const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			}
		],
		"name": "BatchRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_company",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_batchNo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_mfd",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_expiry",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_mrp",
				"type": "uint256"
			}
		],
		"name": "registerBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "riskScore",
				"type": "uint256"
			}
		],
		"name": "RiskUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_riskScore",
				"type": "uint256"
			}
		],
		"name": "updateRiskScore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "batches",
		"outputs": [
			{
				"internalType": "string",
				"name": "company",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "batchNo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "mfd",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "expiry",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "mrp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "riskScore",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_batchId",
				"type": "string"
			}
		],
		"name": "getBatch",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const CONTRACT_ADDRESS = "0x77bA27B2a921953e4212940C4073BCFB981041B9";
const toUnix = (dateStr) => Math.floor(new Date(dateStr).getTime() / 1000);

const FIELDS = [
  { name: "batchId",  label: "Batch ID",           placeholder: "BATCH-2024-001",    type: "text",   full: true  },
  { name: "company",  label: "Company Name",        placeholder: "PharmaGen Ltd.",     type: "text"               },
  { name: "batchNo",  label: "Batch Number",        placeholder: "BN-4492",            type: "text"               },
  { name: "mfd",      label: "Manufacturing Date",  placeholder: "",                   type: "date"               },
  { name: "expiry",   label: "Expiry Date",         placeholder: "",                   type: "date"               },
  { name: "mrp",      label: "MRP (₹)",             placeholder: "499",                type: "number"             },
  { name: "sensorId", label: "sensorId", type: "select" },
  { name: "maxTemp", label: "Max Temperature (°C)", placeholder: "10", type: "number" }
];

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" style={{ animation: "tcSpin .7s linear infinite", transformOrigin: "7.5px 7.5px", flexShrink: 0 }}>
      <circle cx="7.5" cy="7.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="22" strokeDashoffset="8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e872" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff7070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function Admin() {
  const [form, setForm] = useState({
  batchId: "",
  company: "",
  batchNo: "",
  mfd: "",
  expiry: "",
  mrp: "",
  sensorId: "",
  maxTemp: ""
});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [registeredId, setRegisteredId] = useState("");
  const [log, setLog] = useState([]);
  const qrRef = useRef(null);
function toUnix(date) {
  return Math.floor(new Date(date).getTime() / 1000);
}
  const pushLog = (msg, type = "info") =>
    setLog((p) => [{ msg, type, t: new Date().toLocaleTimeString("en-IN", { hour12: false }) }, ...p].slice(0, 8));

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    const { batchId, company, batchNo, mfd, expiry, mrp } = form;
    if (!batchId || !company || !batchNo || !mfd || !expiry || !mrp) {
      setErrorMsg("All fields are required before broadcasting."); setStatus("error"); return;
    }
    setStatus("loading"); setErrorMsg(""); setTxHash(""); setLog([]);
    pushLog("Requesting wallet signature…");
    try {
      // if (!window.ethereum) throw new Error("MetaMask not detected.");
      // await window.ethereum.request({ method: "eth_requestAccounts" });
      // const provider = new ethers.BrowserProvider(window.ethereum);

      // const network = await provider.getNetwork();
    
      // if (network.chainId !== 11155111n) {
      // throw new Error("Please switch to Sepolia network");
      // }

      // const signer = await provider.getSigner();
      // const addr = await signer.getAddress();
      // pushLog(`Wallet connected: ${addr.slice(0, 6)}…${addr.slice(-4)}`, "ok");
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//       pushLog("Sending data to Algorand...");

// const res = await fetch("http://192.168.54.137:5000/store-batch", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({
//     batchId,
//     company,
//     batchNo,
//     mfd: toUnix(mfd),
// expiry: toUnix(expiry),
//     mrp
//   })
// });

// const data = await res.json();

// const txId = data.txId;

// if (!txId) {
//   throw new Error("Failed to get txId from backend");
// }

// pushLog(`Stored on Algorand: ${txId.slice(0, 10)}…`, "ok");
pushLog("Connecting wallet...");

// 1️⃣ Connect wallet
await peraWallet.disconnect(); // reset old session

const accounts = await peraWallet.connect();
const sender = accounts[0];
console.log("Sender:", sender);
peraWallet.reconnectSession().then((accounts) => {
  if (accounts.length) {
    console.log("Reconnected:", accounts[0]);
  }
});
pushLog(`Wallet: ${sender.slice(0, 10)}…`, "ok");

// 2️⃣ Prepare batch data
const batch = {
  batchId,
  company,
  batchNo,
  mfd: toUnix(mfd),
  expiry: toUnix(expiry),
  mrp
};
pushLog("Preparing transaction from backend...");
const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

let params = await algodClient.getTransactionParams().do();
params.flatFee = true;
params.fee = 1000;

// create note
const note = new Uint8Array(Buffer.from(JSON.stringify(batch)));
const receiver = "BFV457HFCN6XYGMDVLQMBQ3PQM2AE6HMILGPC3MLROSVNPYQTCDUYWFHLA";
// ✅ CREATE TXN HERE (IMPORTANT)
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender,
  receiver,
  amount: 1000,
  note,
  suggestedParams: params,
});
console.log("TXN:", txn);
const signedTxns = await peraWallet.signTransaction([
  [
    {
      txn: txn,
      signers: [sender],
    }
  ]
]);
const result = await algodClient.sendRawTransaction(
  signedTxns[0]
).do();
console.log("RESULT:", result);
const txId = result?.txId || txn.txID().toString();
console.log("TX ID:", txId);
await algosdk.waitForConfirmation(algodClient, txId, 2);
pushLog(`Stored on Algorand: ${txId.slice(0, 10)}…`, "ok");
setRegisteredId(txId);

setStatus("success");
// const accounts = await peraWallet.connect();
// const sender = accounts[0];

// const algodClient = new algosdk.Algodv2(
//   "",
//   "https://testnet-api.algonode.cloud",
//   ""
// );

// let params = await algodClient.getTransactionParams().do();
// params.flatFee = true;
// params.fee = 1000;

// const note = new Uint8Array(Buffer.from(JSON.stringify(form)));

// const receiver = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

// const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
//   sender,
//   receiver,
//   amount: 1000,
//   note,
//   suggestedParams: params,
// });

// const signedTxns = await peraWallet.signTransaction([
//   [
//     {
//       txn: txn,
//       signers: [sender],
//     }
//   ]
// ]);

// const result = await algodClient.sendRawTransaction(
//   signedTxns[0]
// ).do();

// const txId = result?.txId || txn.txID().toString();

// await algosdk.waitForConfirmation(algodClient, txId, 2);

// pushLog(`Stored on Algorand: ${txId.slice(0, 10)}…`, "ok");

// setRegisteredId(txId);
// setStatus("success");

      // pushLog(`TX submitted: ${tx.hash.slice(0, 10)}…${tx.hash.slice(-6)}`, "ok");
      // setTxHash(tx.hash);
      // pushLog("Awaiting block confirmation…");
      // await tx.wait();

// ✅ ADD THIS BLOCK HERE
await fetch("https://trustchain-backend-zi7z.onrender.com/assign", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    sensor: form.sensorId,
    batch: form.batchId,
    max_temp: parseFloat(form.maxTemp)
  })
});

pushLog("Sensor assigned to batch successfully", "ok");

pushLog("Confirmed ✓  Batch immortalised on-chain.", "ok");
// setRegisteredId(batchId);
// setStatus("success");
    } catch (err) {
      const msg = err.reason || err.message || "Transaction failed.";
      setErrorMsg(msg);
      pushLog(`Error: ${msg.slice(0, 60)}`, "err");
      setStatus("error");
    }
  };
  
  const productUrl = registeredId ? `${window.location.origin}/product/${registeredId}` : "";

  const getQRSvgString = () => {
    const el = document.querySelector("#tc-qr-target svg");
    if (!el) return null;
    // Clone and ensure explicit width/height for canvas rendering
    const clone = el.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!clone.getAttribute("width"))  clone.setAttribute("width",  "200");
    if (!clone.getAttribute("height")) clone.setAttribute("height", "200");
    return new XMLSerializer().serializeToString(clone);
  };

  const downloadQRpng = useCallback(() => {
    const svgStr = getQRSvgString();
    if (!svgStr) return;
    const SIZE = 512;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.download = `trustchain-qr-${registeredId}.png`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, "image/png");
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [registeredId]);

  const downloadQRsvg = useCallback(() => {
    const svgStr = getQRSvgString();
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.download = `trustchain-qr-${registeredId}.svg`;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, [registeredId]);

  const logColor = (t) => t === "ok" ? "#00e872" : t === "err" ? "#ff7070" : "rgba(226,244,232,0.38)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes tcSpin    { to { transform: rotate(360deg); } }
        @keyframes tcFadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tcPulse   { 0%,100%{opacity:1} 50%{opacity:.15} }
        @keyframes tcScan    { 0%{top:-80px} 100%{top:100vh} }
        @keyframes tcGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(0,200,100,.25)} 50%{box-shadow:0 0 0 6px rgba(0,200,100,0)} }
        @keyframes tcBlink   { 0%,100%{border-color:rgba(0,200,100,.22)} 50%{border-color:rgba(0,200,100,.52)} }
        @keyframes tcReveal  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes tcShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .tc-admin-root {
          min-height: 100vh;
          background: #030f07;
          font-family: 'Space Mono', monospace;
          color: #e2f4e8;
          position: relative;
          overflow-x: hidden;
        }

        .tc-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,200,100,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,100,.04) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        .tc-scanline {
          position: fixed; left:0; right:0; height:90px;
          background: linear-gradient(transparent, rgba(0,200,100,.018), transparent);
          pointer-events: none; z-index: 1;
          animation: tcScan 9s linear infinite;
        }

        .tc-wrap {
          position: relative; z-index: 2;
          max-width: 1000px; margin: 0 auto;
          padding: 40px 20px 60px;
          /* offset for fixed navbar (~64px tall + 16px breathing room) */
          padding-top: 96px;
        }
        @media(min-width:640px){ .tc-wrap{ padding: 104px 32px 72px; } }

        /* ── Header ── */
        .tc-header {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 16px;
          margin-bottom: 44px;
          animation: tcFadeUp .45s ease both;
        }
        .tc-header-left { display:flex; align-items:center; gap:18px; }
        .tc-logo {
          width: 48px; height: 48px; border-radius: 10px;
          border: 1px solid rgba(0,200,100,.35);
          background: rgba(0,200,100,.07);
          display: flex; align-items: center; justify-content: center;
          animation: tcGlow 3s ease-in-out infinite;
        }
        .tc-breadcrumb { font-size:9px; letter-spacing:4px; color:rgba(0,200,100,.45); text-transform:uppercase; margin-bottom:6px; }
        .tc-title { font-family:'Orbitron',sans-serif; font-size:clamp(16px,3vw,22px); font-weight:900; color:#fff; letter-spacing:3px; }
        .tc-net-badge {
          display:flex; align-items:center; gap:8px;
          padding:8px 16px; border:1px solid rgba(0,200,100,.2); border-radius:3px;
          background:rgba(0,200,100,.05); font-size:9px; letter-spacing:2px;
          color:rgba(0,200,100,.6); text-transform:uppercase;
        }
        .tc-net-dot { width:6px; height:6px; border-radius:50%; background:#00e872; animation:tcPulse 2s ease-in-out infinite; }

        /* ── Layout ── */
        .tc-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }
        @media(min-width:780px){ .tc-layout{ grid-template-columns: 1fr 320px; } }

        /* ── Panel ── */
        .tc-panel {
          background: #071409;
          border: 1px solid rgba(0,200,100,.22);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          animation: tcFadeUp .5s .05s ease both;
        }
        .tc-panel::before {
          content:''; position:absolute; top:0; left:0; width:3px; height:100%;
          background: linear-gradient(to bottom, rgba(0,200,100,.6), transparent);
        }
        .tc-panel-strip {
          height: 3px;
          background: linear-gradient(90deg, #00c864 0%, rgba(0,200,100,.3) 60%, transparent 100%);
        }
        .tc-panel-inner { padding: 28px 24px; }
        @media(min-width:640px){ .tc-panel-inner{ padding:32px 32px; } }

        .tc-sec-label {
          font-size:9px; letter-spacing:3.5px; color:rgba(0,200,100,.55);
          text-transform:uppercase; margin-bottom:26px;
          display:flex; align-items:center; gap:10px;
        }
        .tc-sec-line { width:14px; height:1px; background:rgba(0,200,100,.35); }

        /* ── Form ── */
        .tc-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .tc-field-full { grid-column: 1 / -1; }

        .tc-label {
          display:block; font-size:8px; letter-spacing:2.5px;
          color:rgba(0,200,100,.5); text-transform:uppercase; margin-bottom:7px;
        }

        .tc-input {
          width:100%;
          background: #0b1c10;
          border: 1px solid rgba(0,200,100,.18);
          border-radius:5px;
          padding: 11px 14px;
          color: #e2f4e8;
          font-size: 13px;
          font-family: 'Space Mono', monospace;
          outline: none;
          transition: border-color .2s, background .2s;
          letter-spacing: .4px;
        }
        .tc-input:focus { border-color:rgba(0,200,100,.55); background:#0e2416; }
        .tc-input:disabled { opacity:.5; cursor:not-allowed; }
        .tc-input::placeholder { color:rgba(226,244,232,.2); }
        input[type="date"].tc-input::-webkit-calendar-picker-indicator {
          filter: invert(.6) sepia(1) saturate(4) hue-rotate(95deg) brightness(.9);
          cursor:pointer;
        }
        input[type="number"].tc-input::-webkit-outer-spin-button,
        input[type="number"].tc-input::-webkit-inner-spin-button { -webkit-appearance:none; }

        /* ── Submit button ── */
        .tc-submit {
          width:100%; margin-top:26px; padding:15px;
          background: rgba(0,200,100,.09);
          border: 1px solid rgba(0,200,100,.38);
          border-radius:6px;
          color: #00e872;
          font-size:10px; font-family:'Space Mono',monospace;
          font-weight:700; letter-spacing:3px; text-transform:uppercase;
          cursor:pointer; transition:all .2s;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .tc-submit:hover:not(:disabled) {
          background:rgba(0,200,100,.16);
          border-color:rgba(0,200,100,.6);
          box-shadow: 0 0 24px rgba(0,200,100,.12);
        }
        .tc-submit:disabled { opacity:.6; cursor:not-allowed; }

        /* ── Status boxes ── */
        .tc-success {
          display:flex; align-items:flex-start; gap:12px;
          padding:14px 16px; margin-top:18px;
          background:rgba(0,200,100,.07);
          border:1px solid rgba(0,200,100,.3);
          border-left:3px solid #00c864;
          border-radius:4px;
          animation:tcFadeUp .35s ease both;
        }
        .tc-success-text { font-size:12px; color:#00e872; font-weight:700; margin-bottom:4px; letter-spacing:.5px; }
        .tc-success-hash { font-size:10px; color:rgba(0,200,100,.5); font-family:'Space Mono',monospace; word-break:break-all; }

        .tc-error {
          display:flex; align-items:flex-start; gap:12px;
          padding:14px 16px; margin-top:18px;
          background:rgba(255,80,80,.06);
          border:1px solid rgba(255,80,80,.25);
          border-left:3px solid #ff5a5a;
          border-radius:4px;
          font-size:11px; color:#ff7070; line-height:1.6; letter-spacing:.3px;
          animation:tcFadeUp .35s ease both;
        }

        /* ── TX log ── */
        .tc-log { margin-top:24px; }
        .tc-log-title {
          font-size:8px; letter-spacing:2.5px; color:rgba(0,200,100,.4);
          text-transform:uppercase; margin-bottom:10px;
        }
        .tc-log-box {
          background:#060f09;
          border:1px solid rgba(0,200,100,.1);
          border-radius:4px; overflow:hidden;
        }
        .tc-log-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:8px 12px; font-size:10px;
          border-bottom:1px solid rgba(255,255,255,.03);
          font-family:'Space Mono',monospace; line-height:1.5;
          animation:tcFadeUp .25s ease both;
        }
        .tc-log-row:last-child { border-bottom:none; }
        .tc-log-time { color:rgba(226,244,232,.2); flex-shrink:0; font-size:9px; padding-top:1px; }

        /* ── QR Panel ── */
        .tc-qr-panel {
          background: #071409;
          border:1px solid rgba(0,200,100,.22);
          border-radius:8px; overflow:hidden;
          display:flex; flex-direction:column;
          animation: tcFadeUp .5s .1s ease both;
          position:sticky; top:24px;
        }
        .tc-qr-inner { padding:26px 24px; display:flex; flex-direction:column; gap:20px; align-items:center; }

        .tc-qr-frame {
          padding:16px; background:#fff;
          border-radius:8px;
          box-shadow:0 0 0 1px rgba(0,0,0,.08);
          animation:tcReveal .5s ease both;
        }
        .tc-qr-empty {
          width:156px; height:156px;
          border:2px dashed rgba(0,200,100,.18);
          border-radius:8px;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          gap:12px; animation:tcBlink 3s ease-in-out infinite;
        }
        .tc-qr-empty-text {
          font-size:9px; letter-spacing:1.5px; color:rgba(0,200,100,.25);
          text-transform:uppercase; text-align:center; line-height:1.8;
          max-width:130px;
        }

        .tc-qr-id-label { font-size:8px; letter-spacing:2.5px; color:rgba(0,200,100,.45); text-transform:uppercase; text-align:center; }
        .tc-qr-id-val {
          font-family:'Orbitron',sans-serif; font-size:12px; font-weight:900;
          color:#00e872; letter-spacing:2px; text-align:center; word-break:break-all;
          background: linear-gradient(90deg, #00c864, #00ffb4, #00c864);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:tcShimmer 3s linear infinite;
        }
        .tc-qr-url {
          font-size:9px; color:rgba(226,244,232,.18); text-align:center;
          word-break:break-all; line-height:1.7; max-width:260px;
          font-family:'Space Mono',monospace;
        }

        /* ── Download buttons ── */
        .tc-dl-group { display:flex; gap:10px; width:100%; }
        .tc-dl-btn {
          flex:1; padding:10px 8px;
          background:rgba(0,200,100,.06);
          border:1px solid rgba(0,200,100,.22);
          border-radius:5px;
          color:rgba(0,200,100,.7);
          font-size:8px; letter-spacing:2px; text-transform:uppercase;
          font-family:'Space Mono',monospace;
          cursor:pointer; transition:all .18s;
          display:flex; align-items:center; justify-content:center; gap:7px;
        }
        .tc-dl-btn:hover { background:rgba(0,200,100,.13); border-color:rgba(0,200,100,.5); color:#00e872; }
        .tc-dl-btn svg { flex-shrink:0; }

        /* ── Meta rows ── */
        .tc-meta-rows { width:100%; border-top:1px solid rgba(0,200,100,.1); padding-top:18px; display:flex; flex-direction:column; gap:9px; }
        .tc-meta-row { display:flex; justify-content:space-between; align-items:center; }
        .tc-meta-key { font-size:8px; letter-spacing:2px; color:rgba(226,244,232,.25); text-transform:uppercase; }
        .tc-meta-val { font-size:9px; letter-spacing:1px; color:rgba(0,200,100,.6); }

        /* ── Divider ── */
        .tc-divider { height:1px; background:rgba(0,200,100,.08); margin:0 -24px; }
      `}</style>

      <div className="tc-admin-root">
        <div className="tc-grid" />
        <div className="tc-scanline" />

        <div className="tc-wrap">

          {/* ── Header ── */}
          <div className="tc-header">
            <div className="tc-header-left">
              <div className="tc-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e872" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <div className="tc-breadcrumb">TrustChain / Admin Console</div>
                <div className="tc-title">Batch Registration</div>
              </div>
            </div>
            <div className="tc-net-badge">
              <div className="tc-net-dot" />
              Algorand TestNet
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="tc-layout">

            {/* ── Form Panel ── */}
            <div className="tc-panel">
              <div className="tc-panel-strip" />
              <div className="tc-panel-inner">

                <div className="tc-sec-label">
                  <span className="tc-sec-line" />
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 9h6M9 13h6M9 17h4"/>
                  </svg>
                  Product Batch Details
                </div>

                <div className="tc-form-grid">
                  {FIELDS.map(({ name, label, placeholder, type, full }) => (
                    <div key={name} className={full ? "tc-field-full" : ""}>
                      <label className="tc-label">{label}</label>
                      {name === "sensorId" ? (
  <select
  className="tc-input"
  name="sensorId"
  value={form.sensorId}
  onChange={handleChange}
>
  <option value="">Select Sensor</option>
  <option value="sensor1">Sensor 1</option>
  <option value="sensor2">Sensor 2</option>
</select>
) : (
  <input
    className="tc-input"
    name={name}
    type={type}
    placeholder={placeholder}
    value={form[name]}
    onChange={handleChange}
  />
)}
                    </div>
                  ))}
                </div>

                <button
                  className="tc-submit"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                >
                  {status === "loading"
                    ? <><Spinner /> Broadcasting to chain…</>
                    : <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Register on Algorand TestNet
                      </>
                  }
                </button>

                {status === "success" && (
                  <div className="tc-success">
                    <CheckIcon />
                    <div>
                      <div className="tc-success-text">Batch immortalised on-chain ✓</div>
                      {txHash && (
                        <div className="tc-success-hash">
                          TX: {txHash.slice(0, 18)}…{txHash.slice(-8)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="tc-error">
                    <WarnIcon />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {log.length > 0 && (
                  <div className="tc-log">
                    <div className="tc-log-title">Transaction log</div>
                    <div className="tc-log-box">
                      {log.map((entry, i) => (
                        <div className="tc-log-row" key={i}>
                          <span className="tc-log-time">{entry.t}</span>
                          <span style={{ color: logColor(entry.type), fontSize: 10 }}>{entry.msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── QR Panel ── */}
            <div className="tc-qr-panel">
              <div className="tc-panel-strip" />
              <div className="tc-qr-inner">

                <div className="tc-sec-label" style={{ margin: 0, alignSelf: "flex-start" }}>
                  <span className="tc-sec-line" />
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="4" height="4"/>
                  </svg>
                  Verification QR
                </div>

                {registeredId ? (
                  <>
                    <div id="tc-qr-target" className="tc-qr-frame" ref={qrRef}>
                      <QRCodeSVG
                        value={productUrl}
                        size={168}
                        bgColor="#ffffff"
                        fgColor="#030f07"
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div style={{ textAlign: "center", width: "100%" }}>
                      <div className="tc-qr-id-label" style={{ marginBottom: 8 }}>Batch ID</div>
                      <div className="tc-qr-id-val">{registeredId}</div>
                    </div>

                    <div className="tc-qr-url">{productUrl}</div>

                    {/* Download buttons */}
                    <div className="tc-dl-group">
                      <button className="tc-dl-btn" onClick={downloadQRpng}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        PNG
                      </button>
                      <button className="tc-dl-btn" onClick={downloadQRsvg}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        SVG
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="tc-qr-empty">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,200,100,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                      <circle cx="17.5" cy="17.5" r="2.5"/>
                    </svg>
                    <div className="tc-qr-empty-text">QR appears after successful registration</div>
                  </div>
                )}

                <div className="tc-meta-rows">
                  {[
                    ["Network",     "Algorand TestNet"],
                    ["Standard",    "ERC-1155"],
                    ["Immutability","Guaranteed"],
                    ["Audit trail", "On-chain"],
                  ].map(([k, v]) => (
                    <div className="tc-meta-row" key={k}>
                      <span className="tc-meta-key">{k}</span>
                      <span className="tc-meta-val">{v}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
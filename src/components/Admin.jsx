import { useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";

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
      if (!window.ethereum) throw new Error("MetaMask not detected.");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();
    
      if (network.chainId !== 11155111n) {
      throw new Error("Please switch to Sepolia network");
      }

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      pushLog(`Wallet connected: ${addr.slice(0, 6)}…${addr.slice(-4)}`, "ok");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      pushLog("Sending transaction to mempool…");
      const tx = await contract.registerBatch(batchId, company, batchNo, toUnix(mfd).toString(),  toUnix(expiry).toString(), ethers.parseUnits(mrp, 0));
      pushLog(`TX submitted: ${tx.hash.slice(0, 10)}…${tx.hash.slice(-6)}`, "ok");
      setTxHash(tx.hash);
      pushLog("Awaiting block confirmation…");
      await tx.wait();

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
setRegisteredId(batchId);
setStatus("success");
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
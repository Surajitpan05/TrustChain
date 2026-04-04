import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";

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
const formatDate = (unix) =>
  unix
    ? new Date(Number(unix) * 1000).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const formatMRP = (val) =>
  val !== undefined && val !== null ? `₹ ${Number(val).toLocaleString("en-IN")}` : "—";

const getDaysToExpiry = (expiry) => {
  if (!expiry) return null;
  const diff = Number(expiry) * 1000 - Date.now();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const getShelfLifePercent = (mfd, expiry) => {
  if (!mfd || !expiry) return 0;
  const total = Number(expiry) - Number(mfd);
  const elapsed = Date.now() / 1000 - Number(mfd);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

// Risk helpers
const getRiskLevel = (score) => {
  if (score <= 30) return { label: "Low Risk", color: "#00c864", bg: "rgba(0,200,100,0.12)", border: "rgba(0,200,100,0.4)" };
  if (score <= 60) return { label: "Moderate Risk", color: "#f5a623", bg: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.4)" };
  return { label: "High Risk", color: "#ff5a5a", bg: "rgba(255,90,90,0.12)", border: "rgba(255,90,90,0.4)" };
};

const TIMELINE = [
  { id: "manufactured", label: "Manufactured",    iconPath: "M2 20V8l7-4v4l7-4v16H2z", done: true,  ts: "Jan 1, 2024" },
  { id: "qc",           label: "Quality checked", iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", done: true, ts: "Jan 3, 2024" },
  { id: "shipped",      label: "Shipped",          iconPath: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", done: true, ts: "Jan 6, 2024" },
  { id: "in_transit",   label: "In transit",       iconPath: "M5 12h14M12 5l7 7-7 7", done: false, ts: "Pending" },
  { id: "delivered",    label: "Delivered",        iconPath: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01 9 11.01", done: false, ts: "Pending" },
];

function Icon({ name, size = 18, color = "currentColor" }) {
  const paths = {
    factory:  "M2 20V8l7-4v4l7-4v16H2z M6 12H4v2h2v-2z M10 12H8v2h2v-2z",
    shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    truck:    "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
    route:    "M5 12h14M12 5l7 7-7 7",
    check:    "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01 9 11.01",
    chain:    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
    calendar: "M3 4h18v18H3z M16 2v4M8 2v4M3 10h18",
    tag:      "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
    building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
    hash:     "M4 9h16M4 15h16M10 3 8 21M16 3l-2 18",
    dollar:   "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    arrow:    "M19 12H5M12 19l-7-7 7-7",
    lock:     "M3 11h18v11H3zM7 11V7a5 5 0 0 1 10 0v4",
    alert:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    brain:    "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z",
  };
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={paths[name]} />
    </svg>
  );
}

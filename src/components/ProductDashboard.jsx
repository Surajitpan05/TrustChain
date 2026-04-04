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

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono:wght@400;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      @keyframes spin       { to { transform: rotate(360deg); } }
      @keyframes fadeUp     { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn     { from { opacity:0 } to { opacity:1 } }
      @keyframes blink      { 0%,100% { opacity:1 } 50% { opacity:0.15 } }
      @keyframes scanline   { 0% { top:-120px } 100% { top:100% } }
      @keyframes pulse      { 0%,100% { box-shadow:0 0 0 0 rgba(0,200,100,0.35) } 50% { box-shadow:0 0 0 8px rgba(0,200,100,0) } }
      @keyframes floatChip  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-3px) } }
      @keyframes progressBar{ from { width:0 } to { width:var(--target-w) } }
      @keyframes countUp    { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
      @keyframes gaugeAnim  { from { stroke-dashoffset: var(--gauge-start) } to { stroke-dashoffset: var(--gauge-end) } }

      .tc-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #030f07;
        font-family: 'Space Mono', monospace;
        color: #e2f4e8;
        position: relative;
        overflow-x: hidden;
      }

      .tc-grid-bg {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(0,200,100,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,100,0.04) 1px, transparent 1px);
        background-size: 48px 48px;
      }

      .tc-scanline {
        position: fixed; left: 0; right: 0; height: 100px;
        background: linear-gradient(transparent, rgba(0,200,100,0.025), transparent);
        pointer-events: none; z-index: 1;
        animation: scanline 10s linear infinite;
      }

      .tc-main {
        position: relative; z-index: 2;
        flex: 1;
        max-width: 980px; width: 100%;
        margin: 0 auto;
        padding: 32px 16px 32px;
      }
      @media (min-width: 640px) { .tc-main { padding: 40px 28px 32px; } }

      /* ── Topbar ── */
      .tc-topbar {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 32px; gap: 12px; flex-wrap: wrap;
        animation: fadeIn .4s ease both;
      }
      .tc-breadcrumb { font-size: 9px; letter-spacing: 3.5px; color: rgba(0,200,100,0.5); text-transform: uppercase; }
      .tc-back-btn {
        display: flex; align-items: center; gap: 8px;
        background: rgba(0,200,100,0.06); border: 1px solid rgba(0,200,100,0.3);
        border-radius: 3px; color: rgba(0,200,100,0.8);
        padding: 7px 14px; font-size: 9px; letter-spacing: 2px;
        text-transform: uppercase; cursor: pointer;
        font-family: 'Space Mono', monospace; transition: all .2s;
      }
      .tc-back-btn:hover { color: #00c864; border-color: rgba(0,200,100,0.6); background: rgba(0,200,100,0.1); }

      /* ── Hero ── */
      .tc-hero {
        background: #071409;
        border: 1px solid rgba(0,200,100,0.3);
        border-radius: 6px; overflow: hidden;
        margin-bottom: 16px;
        animation: fadeUp .5s .05s ease both;
      }
      .tc-hero-strip { height: 3px; background: linear-gradient(90deg, #00c864 0%, rgba(0,200,100,0.4) 60%, transparent 100%); }
      .tc-hero-inner { padding: 28px 22px 30px; }
      @media (min-width: 640px) { .tc-hero-inner { padding: 32px 32px 34px; } }

      .tc-hero-top {
        display: flex; align-items: flex-start;
        justify-content: space-between; gap: 16px;
        flex-wrap: wrap; margin-bottom: 28px;
      }
      .tc-pid-label { font-size: 9px; letter-spacing: 4px; color: rgba(0,200,100,0.5); text-transform: uppercase; margin-bottom: 8px; }
      .tc-pid { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(18px,4vw,28px); color: #fff; letter-spacing: 2px; }

      .tc-verified-chip {
        display: inline-flex; align-items: center; gap: 9px;
        padding: 10px 18px;
        border: 1px solid rgba(0,200,100,0.5); border-radius: 4px;
        background: rgba(0,200,100,0.1);
        font-size: 9px; font-weight: 700; color: #00e872;
        letter-spacing: 2.5px; text-transform: uppercase;
        white-space: nowrap; flex-shrink: 0;
        animation: pulse 3s ease-in-out infinite, floatChip 4s ease-in-out infinite;
      }
      .tc-expired-chip {
        display: inline-flex; align-items: center; gap: 9px;
        padding: 10px 18px;
        border: 1px solid rgba(255,80,80,0.45); border-radius: 4px;
        background: rgba(255,80,80,0.1);
        font-size: 9px; font-weight: 700; color: #ff7070;
        letter-spacing: 2.5px; text-transform: uppercase;
        white-space: nowrap; flex-shrink: 0;
      }
      .tc-dot { width: 7px; height: 7px; border-radius: 50%; background: #00e872; animation: blink 1.4s step-end infinite; flex-shrink: 0; }

      /* ── Info grid ── */
      .tc-info-grid {
        display: grid; grid-template-columns: repeat(2, 1fr);
        gap: 2px; background: rgba(0,200,100,0.12);
        border: 1px solid rgba(0,200,100,0.2);
        border-radius: 5px; overflow: hidden;
      }
      @media (min-width: 560px) { .tc-info-grid { grid-template-columns: repeat(3, 1fr); } }

      .tc-cell { background: #0b1c10; padding: 18px; position: relative; transition: background .2s; }
      .tc-cell:hover { background: #0f2214; }
      .tc-cell-lbl {
        font-size: 8px; letter-spacing: 2.5px; color: rgba(0,200,100,0.55);
        text-transform: uppercase; margin-bottom: 9px; display: flex; align-items: center; gap: 6px;
      }
      .tc-cell-val {
        font-size: 13px; font-weight: 700; color: #e8f8ee;
        letter-spacing: 0.3px; word-break: break-word; line-height: 1.4;
      }
      .tc-cell-val.mrp { font-family: 'Orbitron', sans-serif; font-size: 15px !important; color: #00e872 !important; }
      .tc-cell-val.status-active { color: #00e872 !important; }
      .tc-cell-val.status-expired { color: #ff7070 !important; }

      /* ── Expiry bar ── */
      .tc-expiry-bar-wrap {
        margin-top: 24px; padding: 16px 18px;
        background: #0b1c10;
        border: 1px solid rgba(0,200,100,0.2);
        border-radius: 5px;
      }
      .tc-expiry-bar-labels {
        display: flex; justify-content: space-between;
        font-size: 9px; letter-spacing: 1.5px;
        color: rgba(0,200,100,0.5); text-transform: uppercase;
        margin-bottom: 10px;
      }
      .tc-expiry-bar-labels span:last-child { color: #00e872; font-weight: 700; }
      .tc-expiry-track { height: 5px; background: rgba(0,200,100,0.12); border-radius: 3px; overflow: hidden; }
      .tc-expiry-fill {
        height: 5px; border-radius: 3px;
        background: linear-gradient(90deg, #00c864, rgba(0,200,100,0.5));
        animation: progressBar 1.5s .5s cubic-bezier(.4,0,.2,1) both;
      }

      /* ── Stats row ── */
      .tc-stats-row {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 2px; background: rgba(0,200,100,0.12);
        border: 1px solid rgba(0,200,100,0.2);
        border-radius: 5px; overflow: hidden;
        margin-bottom: 16px;
        animation: fadeUp .5s .2s ease both;
      }
      .tc-stat { background: #0b1c10; padding: 20px 14px; text-align: center; position: relative; transition: background .2s; }
      .tc-stat:hover { background: #0f2214; }
      .tc-stat:not(:last-child)::after {
        content:''; position:absolute; top:18%; right:0; height:64%;
        width:1px; background:rgba(0,200,100,0.15);
      }
      .tc-stat-num {
        font-family: 'Orbitron', sans-serif; font-size: clamp(17px,3vw,24px);
        font-weight: 900; color: #00e872; letter-spacing: 1px;
        animation: countUp .6s .4s ease both; opacity: 0; animation-fill-mode: both;
      }
      .tc-stat-lbl { font-size: 8px; letter-spacing: 2px; color: rgba(0,200,100,0.5); text-transform: uppercase; margin-top: 7px; }

      /* ── Bottom grid ── */
      .tc-bot-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      @media (min-width: 700px) { .tc-bot-grid { grid-template-columns: 1fr 1fr; } }

      /* ── Card ── */
      .tc-card {
        background: #071409;
        border: 1px solid rgba(0,200,100,0.25);
        border-radius: 6px; overflow: hidden; position: relative;
      }
      .tc-card::before {
        content: ''; position: absolute; top: 0; left: 0;
        width: 3px; height: 100%;
        background: linear-gradient(to bottom, rgba(0,200,100,0.6), transparent);
      }
      .tc-card-inner { padding: 24px 22px; }
      @media (min-width: 640px) { .tc-card-inner { padding: 26px 28px; } }

      .tc-sec-title {
        font-size: 9px; letter-spacing: 3.5px; color: rgba(0,200,100,0.6);
        text-transform: uppercase; margin-bottom: 22px;
        display: flex; align-items: center; gap: 10px;
      }
      .tc-sec-title-line { display: inline-block; width: 14px; height: 1px; background: rgba(0,200,100,0.4); }

      /* ── Risk Score Card ── */
      .tc-risk-card {
        background: #071409;
        border: 1px solid rgba(0,200,100,0.25);
        border-radius: 6px; overflow: hidden; position: relative;
        margin-bottom: 16px;
        animation: fadeUp .5s .15s ease both;
      }
      .tc-risk-card::before {
        content: ''; position: absolute; top: 0; left: 0;
        width: 3px; height: 100%;
        background: linear-gradient(to bottom, rgba(0,200,100,0.6), transparent);
      }
      .tc-risk-inner { padding: 26px 28px; }
      .tc-risk-layout {
        display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
      }
      .tc-risk-gauge-wrap {
        display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0;
      }
      .tc-risk-gauge { position: relative; width: 140px; height: 80px; overflow: visible; }
      .tc-risk-score-num {
        position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
        font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900;
        letter-spacing: 1px; line-height: 1;
      }
      .tc-risk-info { flex: 1; min-width: 200px; }
      .tc-risk-level-badge {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 16px; border-radius: 4px;
        font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
        margin-bottom: 14px;
      }
      .tc-risk-desc { font-size: 11px; color: rgba(226,244,232,0.6); line-height: 1.7; letter-spacing: 0.3px; }
      .tc-risk-bar-track {
        height: 6px; border-radius: 3px; overflow: hidden;
        background: rgba(255,255,255,0.06); margin-top: 16px; position: relative;
      }
      .tc-risk-bar-zones {
        position: absolute; inset: 0; display: flex; border-radius: 3px; overflow: hidden;
      }
      .tc-risk-bar-fill {
        height: 6px; border-radius: 3px;
        animation: progressBar 1.2s .3s cubic-bezier(.4,0,.2,1) both;
        position: relative; z-index: 1;
      }
      .tc-risk-bar-labels {
        display: flex; justify-content: space-between;
        font-size: 8px; letter-spacing: 1.5px; color: rgba(226,244,232,0.3);
        text-transform: uppercase; margin-top: 6px;
      }

      /* ── Timeline ── */
      .tc-tl-step { display: flex; align-items: flex-start; gap: 14px; }
      .tc-tl-icon-col { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
      .tc-tl-connector { width: 1px; height: 26px; margin: 4px 0; background: rgba(0,200,100,0.1); }
      .tc-tl-connector.done { background: rgba(0,200,100,0.3); }
      .tc-tl-content { padding-bottom: 22px; flex: 1; min-width: 0; }
      .tc-tl-label { font-size: 12px; font-weight: 700; letter-spacing: 0.8px; }
      .tc-tl-ts { font-size: 9px; letter-spacing: 1px; margin-top: 4px; }

      /* ── Chain ── */
      .tc-chain-box {
        background: #0b1c10; border: 1px solid rgba(0,200,100,0.15);
        border-radius: 4px; overflow: hidden; margin-bottom: 14px;
      }
      .tc-chain-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; gap: 12px; transition: background .18s; }
      .tc-chain-row:hover { background: rgba(0,200,100,0.06); }
      .tc-chain-row + .tc-chain-row { border-top: 1px solid rgba(0,200,100,0.08); }
      .tc-chain-key { font-size: 9px; letter-spacing: 2px; color: rgba(226,244,232,0.35); text-transform: uppercase; white-space: nowrap; }
      .tc-chain-val { font-size: 10px; color: rgba(0,200,100,0.75); letter-spacing: 0.5px; text-align: right; word-break: break-all; }

      /* ── Integrity banner ── */
      .tc-integrity {
        display: flex; align-items: center; gap: 13px;
        padding: 14px 15px;
        background: rgba(0,200,100,0.06);
        border: 1px solid rgba(0,200,100,0.2);
        border-left: 3px solid #00c864;
        border-radius: 3px; margin-bottom: 14px;
      }
      .tc-integrity-title { font-size: 11px; font-weight: 700; color: #00e872; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
      .tc-integrity-sub { font-size: 9px; color: rgba(226,244,232,0.35); letter-spacing: 0.3px; }

      /* ── Tx hash ── */
      .tc-tx-hash {
        padding: 12px 14px;
        background: #0b1c10; border: 1px solid rgba(0,200,100,0.15);
        border-radius: 3px;
      }
      .tc-tx-label { font-size: 8px; letter-spacing: 2px; color: rgba(0,200,100,0.4); text-transform: uppercase; margin-bottom: 6px; }
      .tc-tx-val { font-size: 9px; color: rgba(0,200,100,0.65); word-break: break-all; letter-spacing: 0.5px; }
      .tc-tx-val span { color: rgba(226,244,232,0.25); }

      /* ── Footer ── */
      .tc-footer {
        position: relative; z-index: 2;
        border-top: 1px solid rgba(0,200,100,0.15);
        background: #030f07;
        padding: 14px 24px;
        display: flex; align-items: center;
        justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      .tc-footer-left { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
      .tc-footer-brand { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); letter-spacing: 2px; }
      .tc-footer-sep { width: 1px; height: 14px; background: rgba(0,200,100,0.15); }
      .tc-footer-meta { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 0.8px; }
      .tc-footer-link { font-size: 9px; letter-spacing: 1px; color: rgba(255,255,255,0.28); text-transform: uppercase; cursor: pointer; background: none; border: none; font-family: 'Space Mono', monospace; padding: 0; transition: color .18s; }
      .tc-footer-link:hover { color: rgba(0,200,100,0.8); }
      .tc-footer-right { display: flex; align-items: center; gap: 8px; }
      .tc-net-dot { width: 6px; height: 6px; border-radius: 50%; background: #00e872; animation: blink 2s ease-in-out infinite; flex-shrink: 0; }
      .tc-net-label { font-size: 9px; letter-spacing: 1.5px; color: rgba(0,200,100,0.55); text-transform: uppercase; }
      .tc-block-pill { font-size: 9px; letter-spacing: 0.8px; color: rgba(226,244,232,0.3); background: rgba(0,200,100,0.06); border: 1px solid rgba(0,200,100,0.12); border-radius: 2px; padding: 3px 8px; }

      /* ── Centred states ── */
      .tc-centered { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; }

      .a1 { animation: fadeUp .5s .05s ease both; }
      .a2 { animation: fadeUp .5s .15s ease both; }
      .a3 { animation: fadeUp .5s .25s ease both; }
      .a4 { animation: fadeUp .5s .35s ease both; }
    `}</style>
  );
}


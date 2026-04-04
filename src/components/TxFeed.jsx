import { S } from "../styles/index.js";
import { useEffect, useRef, useState } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const randHex = (n) =>
  [...Array(n)].map(() => (Math.random() * 16 | 0).toString(16)).join("");

const randId = () =>
  "TC-" + randHex(4).toUpperCase() + "-" + randHex(3).toUpperCase();

const randQR = () => "QR:" + randHex(6).toUpperCase();

// ── boot sequence ─────────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "Loading TrustChain Supply Node v2.4.1…",     ms: 0,    dim: false },
  { text: "Mounting QR verification engine…   [OK]",    ms: 340,  dim: true  },
  { text: "Loading SHA-256 hash registry…     [OK]",    ms: 680,  dim: true  },
  { text: "Connecting smart contract layer…",            ms: 1000, dim: true  },
  { text: `  Contract: 0x${randHex(20)}…`,              ms: 1180, dim: true, small: true },
  { text: "IoT sensor bridge: ACTIVE",                  ms: 1500, dim: false },
  { text: "Peer discovery…",                            ms: 1800, dim: true  },
  { text: "  12 supply chain nodes found",              ms: 2000, dim: true, small: true },
  { text: "Genesis block verified. Chain intact.",       ms: 2350, dim: false },
  { text: "Streaming live events…",                     ms: 2700, dim: false },
];

// ── live event generators ─────────────────────────────────────────────────────
const EVENT_TYPES = [
  () => ({
    badge: "QR SCAN",
    color: "#00ffb4",
    msg: `${randQR()} scanned — ${["Mumbai", "Delhi", "Chennai", "Kolkata", "Pune"][Math.random() * 5 | 0]} hub — product AUTHENTIC`,
  }),
  () => ({
    badge: "SHIPMENT",
    color: "#60d0ff",
    msg: `Batch ${randId()} departed ${["Warehouse A", "Port 7", "Factory 3"][Math.random() * 3 | 0]} → next checkpoint in ${(Math.random() * 48 + 2) | 0}h`,
  }),
  () => ({
    badge: "CONTRACT",
    color: "#c878ff",
    msg: `SmartContract triggered — payment ₹${((Math.random() * 50000 + 1000) | 0).toLocaleString()} released to supplier ${randHex(4).toUpperCase()}`,
  }),
  () => ({
    badge: "IOT PING",
    color: "#f0c040",
    msg: `Sensor #${((Math.random() * 999 + 1) | 0)} — Temp: ${(Math.random() * 8 + 2).toFixed(1)}°C  Humidity: ${(Math.random() * 30 + 40) | 0}%  Status: NORMAL`,
  }),
  () => ({
    badge: "ALERT",
    color: "#ff5f5f",
    msg: `Anomaly detected — ${randId()} tamper seal broken at checkpoint ${((Math.random() * 9 + 1) | 0)}`,
  }),
  () => ({
    badge: "VERIFIED",
    color: "#00ffb4",
    msg: `Product ${randId()} certified — Farm→Shelf chain complete  ${(Math.random() * 3 + 1).toFixed(1)}s verify time`,
  }),
  () => ({
    badge: "FRAUD",
    color: "#ff5f5f",
    msg: `BLOCKED counterfeit attempt — QR ${randQR()} hash mismatch — flagged`,
  }),
  () => ({
    badge: "HANDOFF",
    color: "#60d0ff",
    msg: `Custody transfer: ${randId()} — Distributor→Retailer`,
  }),
  () => ({
    badge: "REGISTERED",
    color: "#80e880",
    msg: `New product on-chain — SKU: ${randHex(8).toUpperCase()}  Batch: ${((Math.random() * 5000 + 100) | 0)} units`,
  }),
];

// ── component ─────────────────────────────────────────────────────────────────
export default function TxFeed({ txFeed }) {
  const [phase, setPhase] = useState("boot"); // "boot" | "live"
  const [bootVisible, setBootVisible] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ peers: 0, pending: 1247, verified: 0 });
  const [blockNum, setBlockNum] = useState(2841900);

  const hashRef = useRef("");
  const bgRef   = useRef(null);

  // ── scrolling hash waterfall ────────────────────────────────────────────────
  useEffect(() => {
    hashRef.current = [...Array(800)].map(() => randHex(8)).join(" ");
    const t = setInterval(() => {
      hashRef.current = hashRef.current.slice(9) + randHex(8) + " ";
      if (bgRef.current) bgRef.current.textContent = hashRef.current;
    }, 100);
    return () => clearInterval(t);
  }, []);

  // ── boot sequence ───────────────────────────────────────────────────────────
  useEffect(() => {
    const timers = [];
    BOOT_LINES.forEach((line, i) => {
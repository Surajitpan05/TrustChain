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
      const t = setTimeout(() => {
        setBootVisible((prev) => [...prev, line]);
      }, line.ms);
      timers.push(t);
    });
    const done = setTimeout(() => {
      setPhase("live");
      setStats({ peers: 12, pending: 1247, verified: 0 });
    }, 3200);
    timers.push(done);
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── live feed from txFeed prop ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "live" || txFeed.length === 0) return;
    const latest = txFeed[0];
    // Map incoming tx to TrustChain event format
    const ev = {
      badge: "TX",
      color: "#00ffb4",
      msg: latest.msg,
      visibleText: "",
      key: Date.now(),
    };
    setEvents((prev) => [ev, ...prev.slice(0, 8)]);

    let i = 0;
    const iv = setInterval(() => {
      i++;
      setEvents((prev) => {
        const next = [...prev];
        if (next[0]) next[0] = { ...next[0], visibleText: latest.msg.slice(0, i) };
        return next;
      });
      if (i >= latest.msg.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [txFeed, phase]);

  // ── auto-generate demo events when no txFeed ────────────────────────────────
  useEffect(() => {
    if (phase !== "live") return;
    const fire = () => {
      const ev = EVENT_TYPES[Math.random() * EVENT_TYPES.length | 0]();
      setBlockNum((b) => b + 1);
      setStats((s) => ({
        peers: s.peers,
        pending: Math.max(0, s.pending + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 | 0)),
        verified: ev.badge === "VERIFIED" || ev.badge === "QR SCAN" ? s.verified + 1 : s.verified,
      }));
      setEvents((prev) => [
        { ...ev, visibleText: "", key: Date.now() + Math.random() },
        ...prev.slice(0, 8),
      ]);
      // typewriter on newest entry
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setEvents((prev) => {
          const next = [...prev];
          if (next[0]) next[0] = { ...next[0], visibleText: ev.msg.slice(0, i) };
          return next;
        });
        if (i >= ev.msg.length) clearInterval(iv);
      }, 14);
    };

    fire();
    const schedNext = () => {
      const t = setTimeout(() => { fire(); schedNext(); }, Math.random() * 2200 + 800);
      return t;
    };
    const t = schedNext();
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div style={S.txFeed}>
      <style>{css}</style>

      {/* hash waterfall bg */}
      <div ref={bgRef} style={sty.hashBg} />
      {/* scanline */}
      <div style={sty.scanline} />

      <div style={sty.inner}>
        {/* ── header bar ── */}
        <div style={sty.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={sty.statusDot} className="tc-pulse" />
            <span style={sty.brand}>TrustChain</span>
          </div>
          <span style={sty.blockNum}>
            BLOCK #{blockNum.toLocaleString()}
          </span>
        </div>

        {/* ── stats row ── */}
        <div style={sty.statsRow}>
          {[
            { label: "PEERS",   value: stats.peers,   color: "#00ffb4" },
            { label: "PENDING", value: stats.pending,  color: "#f0c040" },
            { label: "VERIFIED",value: stats.verified, color: "#60d0ff" },
          ].map(({ label, value, color }) => (
            <div key={label} style={sty.statBox}>
              <div style={sty.statLabel}>{label}</div>
              <div style={{ ...sty.statValue, color }}>{value || "—"}</div>
            </div>
          ))}
        </div>

        {/* ── boot phase ── */}
        {phase === "boot" && (
          <div>
            <div style={sty.sectionLabel}>$ INITIALIZING NODE...</div>
            {bootVisible.map((line, i) => (
              <div
                key={i}
                className="tc-fade"
                style={{
                  fontSize: line.small ? "9px" : "11px",
                  color: line.dim ? "rgba(0,255,180,0.35)" : "rgba(0,255,180,0.7)",
                  lineHeight: 1.85,
                }}
              >
                {line.text}
              </div>
            ))}
            <span className="tc-blink" style={sty.cursor}>▋</span>
          </div>
        )}

        {/* ── live feed phase ── */}
        {phase === "live" && (
          <div>
            <div style={sty.sectionLabel}>
              <span className="tc-blink" style={{ fontSize: 7, marginRight: 6 }}>●</span>
              LIVE SUPPLY CHAIN FEED
            </div>

            {events.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                Awaiting events…
              </div>
            ) : (
              events.map((ev, i) => (
                <div
                  key={ev.key}
                  className="tc-fade"
                  style={sty.eventRow}
                >
                  <div style={sty.eventTop}>
                    <span
                      style={{
                        ...sty.badge,
                        color: ev.color,
                        borderColor: ev.color,
                      }}
                    >
                      {ev.badge}
                    </span>
                    <span style={sty.timestamp}>
                      {new Date().toLocaleTimeString("en-IN", { hour12: false })}
                    </span>
                  </div>
                  <div style={{ ...sty.eventMsg, color: i === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.42)" }}>
                    {i === 0
                      ? ev.visibleText || ev.msg
                      : ev.msg}
                    {i === 0 && (ev.visibleText?.length ?? 0) < ev.msg.length && (
                      <span className="tc-blink" style={sty.cursor}>▋</span>
                    )}
                  </div>
                </div>
              ))
            )}

            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="tc-blink" style={sty.cursor}>▋</span>
              <span style={sty.footerStat}>
                {stats.verified} verified · {stats.pending} pending · {stats.peers} peers
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── local styles (extends S.txFeed from your style sheet) ────────────────────
const sty = {
  hashBg: {
    position: "absolute", inset: 0,
    fontSize: "8px", color: "#00ffb4", opacity: 0.018,
    lineHeight: 1.5, overflow: "hidden",
    wordBreak: "break-all", padding: "8px",
    pointerEvents: "none", whiteSpace: "pre-wrap",
  },
  scanline: {
    position: "absolute", left: 0, right: 0, height: "80px",
    background: "linear-gradient(transparent,rgba(0,255,180,0.025),transparent)",
    animation: "scanline 5s linear infinite",
    pointerEvents: "none", zIndex: 0,
  },
  inner:    { position: "relative", zIndex: 1 },
  header:   {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "14px", paddingBottom: "10px",
    borderBottom: "1px solid rgba(0,255,180,0.1)",
  },
  statusDot: {
    width: 7, height: 7, borderRadius: "50%", background: "#00ffb4", flexShrink: 0,
  },
  brand:    { fontSize: "10px", color: "rgba(0,255,180,0.5)", letterSpacing: "2.5px", textTransform: "uppercase" },
  blockNum: { fontSize: "9px", color: "rgba(0,255,180,0.3)", letterSpacing: "1px" },
  statsRow: { display: "flex", gap: "8px", marginBottom: "14px" },
  statBox:  {
    flex: 1, background: "rgba(0,255,180,0.04)",
    border: "0.5px solid rgba(0,255,180,0.1)", borderRadius: "6px", padding: "7px 10px",
  },
  statLabel:{ fontSize: "8px", color: "rgba(0,255,180,0.35)", letterSpacing: "1.5px", marginBottom: "3px" },
  statValue:{ fontSize: "13px", fontWeight: 500 },
  sectionLabel: {
    fontSize: "9px", color: "rgba(0,255,180,0.3)",
    letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px",
  },
  eventRow: {
    marginBottom: "9px", paddingBottom: "9px",
    borderBottom: "0.5px solid rgba(0,255,180,0.07)",
  },
  eventTop: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" },
  badge: {
    fontSize: "8px", letterSpacing: "1.5px",
    border: "0.5px solid", borderRadius: "3px",
    padding: "1px 5px", flexShrink: 0, opacity: 0.9,
  },
  timestamp:{ fontSize: "9px", color: "rgba(0,255,180,0.2)", marginLeft: "auto", flexShrink: 0 },
  eventMsg: { fontSize: "11px", lineHeight: 1.55, letterSpacing: "0.3px" },
  cursor:   { color: "#00ffb4", fontSize: "11px" },
  footerStat:{ fontSize: "9px", color: "rgba(0,255,180,0.25)" },
};

const css = `
  @keyframes blink    { 50%{opacity:0} }
  @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
  @keyframes fadeSlide{ from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .tc-blink  { animation: blink     1s step-end infinite; }
  .tc-fade   { animation: fadeSlide 0.25s ease forwards; }
  .tc-pulse  { animation: pulse     2s ease-in-out infinite; }
`;
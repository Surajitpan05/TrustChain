import { S } from "../styles/index.js";

const STATS = [
  { num: "2.4M+", label: "Products Verified" },
  { num: "0.3ms", label: "Avg Scan Time" },
  { num: "100%",  label: "Tamper-Proof" },
];

const TECH_PILLS = ["Ethereum L2", "IPFS Storage", "ERC-1155", "IoT Oracle", "ZK Proofs", "Chainlink"];

export default function Hero() {
  return (
    <div style={S.hero}>

      {/* Background layers */}
      <div style={S.scanlines} />
      <div style={S.gridBg} />
      <div style={S.radialBloom} />
      <div style={S.cornerTL} />
      <div style={S.cornerBR} />

      <div style={S.content}>

        {/* Eyebrow */}
        <div style={S.eyebrow}>
          <div style={S.eyebrowDot} />
          Live on Mainnet &nbsp;·&nbsp; 99.9% Uptime
        </div>

        {/* Heading */}
        <h1 style={S.h1}>
          <span style={S.h1Line}>Verify</span>
          <span style={S.h1Line}>
            <span style={S.h1HighlightWrap}>
              <span style={S.h1Strike} />
              Every Product
            </span>
          </span>
          <span style={{ ...S.h1Line, ...S.h1Dim }}>on the Chain.</span>
        </h1>

        {/* Divider */}
        <div style={S.dividerRow}>
          <span style={S.dividerLabel}>Supply chain verification protocol</span>
          <div style={S.dividerLine} />
        </div>

        {/* Body */}
        <p style={S.p}>
          Every product, every handoff —{" "}
          <em style={S.pEmphasis}>immutably recorded on-chain.</em>{" "}
          Smart contracts auto-execute verification. QR codes bind physical
          goods to blockchain state. IoT sensors stream real-time data.{" "}
          <span style={S.pStrong}>Fraud has nowhere to hide.</span>
        </p>
        
        {/* Stats */}
        <div style={S.statsRow}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                ...S.stat,
                borderRight: i < STATS.length - 1
                  ? "1px solid rgba(0,255,136,0.1)"
                  : "none",
              }}
            >
              <div style={i === 0 ? S.statNumGlitch : S.statNum}>{s.num}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scan input */}
        <div style={S.inputSection}>
          <div style={S.inputLabelRow}>
            <span style={S.inputLabel}>Scan ID</span>
            <div style={S.inputLabelLine} />
          </div>
          <div style={S.inputWrap}>
            <span style={S.inputPrefix}>0x ›</span>
            <input
              style={S.storeInp}
              type="text"
              placeholder="A3F2...B9E1 or BATCH-ID"
              onFocus={e => {
                e.target.parentElement.style.borderColor = "rgba(0,255,136,0.6)";
                e.target.parentElement.style.boxShadow  = "0 0 24px rgba(0,255,136,0.1)";
              }}
              onBlur={e => {
                e.target.parentElement.style.borderColor = "rgba(0,255,136,0.28)";
                e.target.parentElement.style.boxShadow  = "none";
              }}
            />
            <button style={S.goBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="#020c08" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div style={S.inputHint}>▸ Enter product hash, batch ID, or QR code string</div>
        </div>

        {/* Tech pills */}
        <div style={S.techPills}>
          {TECH_PILLS.map(t => (
            <span key={t} style={S.pill}>{t}</span>
          ))}
        </div>

      </div>

      {/* Keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes heroGlitch {
          0%, 88%, 100% { transform: none; text-shadow: none; }
          90%  { transform: translateX(-2px); text-shadow: 2px 0 rgba(0,255,136,0.6); }
          92%  { transform: translateX(2px);  text-shadow: -2px 0 rgba(255,0,100,0.4); }
          94%  { transform: none; text-shadow: none; }
        }
      `}</style>
    </div>
  );
}

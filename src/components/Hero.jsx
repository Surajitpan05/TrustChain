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

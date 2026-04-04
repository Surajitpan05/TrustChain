import { S } from "../styles/index.js";

const STATUS_ROWS = [
  { color: "#cc8822", label: "Unverified — arc from top-right" },
  { color: "#00ff88", label: "Smart contract scan in hub" },
  { color: "#44ffaa", label: "QR-verified — exit bottom-right" },
];

export default function ChainStatusBadge() {
  return (
    <div style={S.badge}>
      <div style={S.badgeTitle}>⬡ CHAIN STATUS</div>
      {STATUS_ROWS.map(({ color, label }) => (
        <div key={label} style={S.badgeRow}>
          <div style={S.dot(color)} />
          <span style={S.badgeLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}
export const S = {

  // ── Root & Canvas ─────────────────────────────────────────────────────────
  root: {
    width: "100vw",
    minHeight: "100vh",
    overflowX: "hidden",
    overflowY: "auto",
    position: "relative",
    fontFamily: "'Space Mono', monospace",
    background: "#010804",
  },

  canvas: {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    pointerEvents: "none",
  },

  // ── Nav ───────────────────────────────────────────────────────────────────
  nav: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 48px)",
    maxWidth: 1000,
    background: "rgba(1,7,4,0.92)",
    borderRadius: 4,
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(0,200,100,0.18)",
    boxShadow: "0 0 40px rgba(0,200,100,0.04)",
  },

  // ── PAGE LAYOUT ───────────────────────────────────────────────────────────
  page: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "40px",
    padding: "120px 40px 40px",
  },

  // ── Hero root ─────────────────────────────────────────────────────────────
  hero: {
    position: "relative",
    flex: 1,
    maxWidth: 500,
    overflow: "hidden",
  },

  // Background layers (absolute children inside hero)
  scanlines: {
    position: "absolute",
    inset: 0,
    background: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,200,100,0.016) 2px,
      rgba(0,200,100,0.016) 4px
    )`,
    pointerEvents: "none",
    zIndex: 0,
  },

  gridBg: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,200,100,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,100,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },

  radialBloom: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "60%",
    height: "80%",
    background: "radial-gradient(ellipse at center, rgba(0,200,100,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  cornerTL: {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    width: 32,
    height: 32,
    borderTop: "1px solid rgba(0,200,100,0.3)",
    borderLeft: "1px solid rgba(0,200,100,0.3)",
    pointerEvents: "none",
    zIndex: 2,
  },

  cornerBR: {
    position: "absolute",
    bottom: "1rem",
    right: "1rem",
    width: 32,
    height: 32,
    borderBottom: "1px solid rgba(0,200,100,0.3)",
    borderRight: "1px solid rgba(0,200,100,0.3)",
    pointerEvents: "none",
    zIndex: 2,
  },

  // Content wrapper inside hero (sits above bg layers)
  content: {
    position: "relative",
    zIndex: 1,
  },

  // ── Eyebrow ───────────────────────────────────────────────────────────────
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'Space Mono', monospace",
    fontSize: ".58rem",
    letterSpacing: "4px",
    color: "#00c864",
    textTransform: "uppercase",
    marginBottom: 18,
    border: "1px solid rgba(0,200,100,0.22)",
    padding: "4px 10px 4px 8px",
    borderRadius: 2,
    opacity: 0,
    animation: "revealLine .6s .05s ease forwards",
  },

  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#00c864",
    boxShadow: "0 0 10px #00c864",
    animation: "blink 1.4s infinite",
    flexShrink: 0,
  },

  // ── H1 ────────────────────────────────────────────────────────────────────
  h1: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: "clamp(1.7rem, 3.2vw, 2.8rem)",
    color: "#e8fff4",
    lineHeight: 1.08,
    marginBottom: 10,
    letterSpacing: "-0.5px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    opacity: 0,
    animation: "revealLine .65s .22s ease forwards",
  },

  h1Line: {
    display: "block",
  },

  h1Highlight: {
    display: "inline-flex",
    alignItems: "center",
    position: "relative",
    width: "fit-content",
  },

  h1HighlightBar: {
    position: "absolute",
    inset: "-2px -8px",
    background: "rgba(0,200,100,0.08)",
    borderLeft: "3px solid #00c864",
    borderRadius: "2px",
  },

  h1HighlightWrap: {
    display: "inline-block",
    position: "relative",
    color: "#00c864",
    textShadow: "0 0 30px rgba(0,200,100,0.5), 0 0 60px rgba(0,200,100,0.18)",
  },

  h1Strike: {
    position: "absolute",
    left: -6,
    right: -6,
    top: "50%",
    height: 3,
    background: "rgba(0,200,100,0.18)",
    transform: "translateY(-50%) skewX(-6deg)",
  },

  h1green: {
    color: "#00c864",
    textShadow: "0 0 30px rgba(0,200,100,0.5), 0 0 60px rgba(0,200,100,0.18)",
  },

  h1Dim: {
    color: "rgba(232,255,244,0.22)",
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: "1.4rem",
  },

  dividerLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.28em",
    color: "rgba(0,200,100,0.5)",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: "linear-gradient(90deg, rgba(0,200,100,0.3), transparent)",
  },

  // ── Paragraph ─────────────────────────────────────────────────────────────
  p: {
    fontSize: ".76rem",
    color: "rgba(180,230,210,0.6)",
    lineHeight: 1.9,
    marginBottom: 26,
    maxWidth: 380,
  },

  pEmphasis: {
    fontStyle: "normal",
    color: "rgba(232,255,244,0.9)",
  },

  pStrong: {
    fontWeight: 700,
    color: "#00c864",
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: {
    display: "flex",
    border: "1px solid rgba(0,200,100,0.14)",
    borderRadius: 4,
    marginBottom: "2.4rem",
    overflow: "hidden",
    background: "rgba(0,200,100,0.025)",
  },

  stat: {
    flex: 1,
    padding: "1rem 1.2rem",
  },

  statNum: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#00c864",
    letterSpacing: "-0.02em",
    lineHeight: 1,
    marginBottom: 4,
  },

  statNumGlitch: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#00c864",
    letterSpacing: "-0.02em",
    lineHeight: 1,
    marginBottom: 4,
    display: "inline-block",
    animation: "heroGlitch 6s infinite",
  },

  statLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.2em",
    color: "rgba(180,230,210,0.35)",
    textTransform: "uppercase",
  },

  // ── Input ─────────────────────────────────────────────────────────────────
  inputSection: {
    marginBottom: "2rem",
  },

  inputLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  inputLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.25em",
    color: "rgba(0,200,100,0.55)",
    textTransform: "uppercase",
  },

  inputLabelLine: {
    flex: 1,
    height: 1,
    background: "rgba(0,200,100,0.12)",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid rgba(0,200,100,0.28)",
    borderRadius: 3,
    background: "rgba(0,200,100,0.03)",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  inputPrefix: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: "rgba(0,200,100,0.45)",
    padding: "0 12px",
    borderRight: "1px solid rgba(0,200,100,0.14)",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    letterSpacing: "0.1em",
    background: "rgba(0,200,100,0.02)",
    alignSelf: "stretch",
  },

  storeInp: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: "#e8fff4",
    padding: "13px 12px",
    letterSpacing: "0.04em",
  },

  goBtn: {
    background: "#00c864",
    border: "none",
    cursor: "pointer",
    padding: "0 16px",
    alignSelf: "stretch",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.15s",
  },

  inputHint: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.18em",
    color: "rgba(180,230,210,0.2)",
    textTransform: "uppercase",
    marginTop: 7,
    paddingLeft: 2,
  },

  // ── Sub tag (kept from original) ──────────────────────────────────────────
  subTag: {
    display: "inline-flex",
    alignItems: "center",
    marginBottom: 16,
    opacity: 0,
    animation: "revealLine .6s .35s ease forwards",
  },

  subTagText: {
    fontSize: ".58rem",
    color: "rgba(0,200,100,0.5)",
    letterSpacing: "3px",
    textTransform: "uppercase",
    borderLeft: "2px solid rgba(0,200,100,0.3)",
    paddingLeft: 8,
  },

  // ── Tech pills ────────────────────────────────────────────────────────────
  techPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "rgba(180,230,210,0.4)",
    border: "1px solid rgba(180,230,210,0.1)",
    padding: "5px 10px",
    borderRadius: 2,
    textTransform: "uppercase",
    cursor: "default",
  },

  // ── Tx Feed ───────────────────────────────────────────────────────────────
  txFeed: {
    position: "relative",
    width: "360px",
    background: "#010509",
    borderLeft: "1px solid rgba(0,180,140,0.15)",
    padding: "16px",
    fontFamily: "'Courier New', monospace",
  },

  txItem: {
    fontSize: "12px",
    color: "#00b878",
    marginBottom: "6px",
    lineHeight: "1.5",
    letterSpacing: "0.5px",
    whiteSpace: "pre-wrap",
  },

  // ── Badge ─────────────────────────────────────────────────────────────────
  badge: {
  position: "fixed",
  top: "530px",  
   // 👈 control vertical position from top
  right: "20px",
  zIndex: 100,
  background: "rgba(1,7,4,0.92)",
  border: "1px solid rgba(0,200,100,0.18)",
  borderRadius: 4,
  padding: "5px 2px",
  backdropFilter: "blur(12px)",
  display: "flex",
  flexDirection: "column",
  gap: 3,
  minWidth: 220,
  
},


  badgeTitle: {
    fontSize: ".10rem",
    color: "#00c864",
    fontWeight: 200,
    letterSpacing: "0.18em",
  },

  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: ".63rem",
  },

  dot: (c) => ({
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: c,
    boxShadow: `0 0 6px ${c}`,
  }),

  badgeLabel: {
    color: "rgba(180,230,210,0.5)",
  },
};
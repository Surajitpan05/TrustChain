// FooterHome.jsx
// Holographic HUD-style animated blockchain footer — Enhanced Edition.
// Drop-in, zero props required — self-animates via its own rAF loop.
//
// Center: TrustChain logo + "Contact Us" link
//
// Usage:
//   import FooterHome from "./FooterHome";
//   <FooterHome />
//
// Optional ref for external rAF control:
//   const ref = useRef(); <FooterHome ref={ref} />
//   ref.current?.tick(now);

import {
  useEffect, useRef, useCallback,
  forwardRef, useImperativeHandle,
} from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const W      = 760;
const H      = 68;
const SPEED  = 38;
const GREEN  = "#00ff88";
const AMBER  = "#ffaa00";
const CYAN   = "#00eeff";
const GLYPHS = "0123456789ABCDEF∑∏∆Ω≈≡±√∞";

function pad4(n) { return String(n).padStart(4, "0"); }

function makeMatrixCols() {
  const numCols = Math.floor(W / 14);
  return Array.from({ length: numCols }, (_, i) => ({
    x:          i * 14 + 7,
    y:          -Math.random() * H * 3,
    speed:      18 + Math.random() * 28,
    brightness: 0.04 + Math.random() * 0.08,
  }));
}

function makeSparks(count) {
  return Array.from({ length: count }, () => ({
    x:       Math.random() * W,
    y:       Math.random() * H,
    vx:      (Math.random() - 0.5) * 22,
    vy:      (Math.random() - 0.5) * 8,
    life:    Math.random(),
    maxLife: 0.5 + Math.random() * 1.4,
    col:     Math.random() > 0.5 ? "rgba(0,255,136," : "rgba(0,238,255,",
  }));
}

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Keyframes (injected once into <head>) ────────────────────────────────────
const KEYFRAMES = `
  @keyframes footerScanlinesDrift {
    0%   { background-position: 0 0; }
    100% { background-position: 0 68px; }
  }
  @keyframes footerValueFlash {
    0%   { opacity: 1; }
    20%  { opacity: 0.2; color: #ffffff; }
    40%  { opacity: 1; }
    60%  { opacity: 0.7; }
    100% { opacity: 1; }
  }
  @keyframes footerRipple1 {
    0%   { transform: scale(.5); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes footerRipple2 {
    0%   { transform: scale(.5); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes tcLogoPulse {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(0,255,136,0.6)); }
    50%       { filter: drop-shadow(0 0 10px rgba(0,255,136,1)) drop-shadow(0 0 20px rgba(0,238,255,0.4)); }
  }
  @keyframes tcHexSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes tcBrandFlicker {
    0%,96%,100% { opacity: 1; }
    97%          { opacity: 0.4; }
    98%          { opacity: 1; }
    99%          { opacity: 0.6; }
  }
`;

// ── Static style objects ──────────────────────────────────────────────────────
const S = {
  footer: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    height: `${H}px`,
    background: "#050f0a",
    borderTop: "1px solid rgba(0,255,136,0.25)",
    boxShadow: "0 -6px 40px rgba(0,255,136,0.1), 0 -1px 0 rgba(0,255,136,0.2)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 18px",
    fontFamily: "'Courier New', Courier, monospace",
    zIndex: 9999, overflow: "hidden", boxSizing: "border-box",
  },
  scanlineOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: "none", zIndex: 1,
    background:
      "repeating-linear-gradient(0deg,transparent,transparent 2px," +
      "rgba(0,255,136,0.012) 2px,rgba(0,255,136,0.012) 4px)",
    animation: "footerScanlinesDrift 8s linear infinite",
  },
  canvas: { position: "absolute", left: 0, top: 0, zIndex: 1 },
  side: {
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "center", flexShrink: 0,
  },
  divider: { width: 1, height: 28, background: "rgba(0,255,136,0.12)", flexShrink: 0 },
  lbl: { color: "rgba(0,255,136,0.35)", fontSize: 7, letterSpacing: ".18em", textTransform: "uppercase" },
};

// ── TrustChain center brand + Contact Us ──────────────────────────────────────
function TrustChainCenter() {
  const contactRef = useRef(null);

  const onEnter = () => {
    if (!contactRef.current) return;
    contactRef.current.style.color         = GREEN;
    contactRef.current.style.textShadow    = `0 0 12px ${GREEN}, 0 0 24px rgba(0,255,136,0.4)`;
    contactRef.current.style.letterSpacing = ".22em";
    contactRef.current.style.borderColor   = "rgba(0,255,136,0.5)";
    contactRef.current.style.background    = "rgba(0,255,136,0.06)";
    contactRef.current.style.boxShadow     = "0 0 16px rgba(0,255,136,0.15)";
  };

  const onLeave = () => {
    if (!contactRef.current) return;
    contactRef.current.style.color         = "rgba(0,255,136,0.55)";
    contactRef.current.style.textShadow    = "none";
    contactRef.current.style.letterSpacing = ".18em";
    contactRef.current.style.borderColor   = "rgba(0,255,136,0.2)";
    contactRef.current.style.background    = "transparent";
    contactRef.current.style.boxShadow     = "none";
  };

  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      transform: "translate(40%, -50%)",
      zIndex: 4,
      display: "flex", alignItems: "center", gap: 10,
      pointerEvents: "auto",
    }}>
      {/* Left separator */}
      <div style={{
        width: 1, height: 32, flexShrink: 0,
        background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.2), transparent)",
      }} />

      {/* Logo + wordmark */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        animation: "tcBrandFlicker 8s ease-in-out infinite",
        cursor: "default",
      }}>
        {/* Hex logo SVG */}
        <svg width="28" height="28" viewBox="0 0 28 28"
          style={{ animation: "tcLogoPulse 3s ease-in-out infinite", flexShrink: 0 }}>
          {/* Spinning outer dashed ring */}
          <g style={{ transformOrigin: "14px 14px", animation: "tcHexSpin 12s linear infinite" }}>
            <polygon
              points="14,2 24,8 24,20 14,26 4,20 4,8"
              fill="none"
              stroke="rgba(0,255,136,0.3)"
              strokeWidth="0.75"
              strokeDasharray="3 2"
            />
          </g>
          {/* Static inner hex */}
          <polygon
            points="14,5 21,9.5 21,18.5 14,23 7,18.5 7,9.5"
            fill="rgba(0,255,136,0.06)"
            stroke="rgba(0,255,136,0.55)"
            strokeWidth="1"
          />
          {/* Chain triangle nodes */}
          <line x1="14"  y1="9.5"  x2="10"  y2="16.5" stroke="rgba(0,255,136,0.5)"  strokeWidth="1" />
          <line x1="14"  y1="9.5"  x2="18"  y2="16.5" stroke="rgba(0,255,136,0.5)"  strokeWidth="1" />
          <line x1="10"  y1="16.5" x2="18"  y2="16.5" stroke="rgba(0,238,255,0.4)"  strokeWidth="1" />
          <circle cx="14" cy="9.5"  r="1.6" fill={GREEN} />
          <circle cx="10" cy="16.5" r="1.6" fill={CYAN}  />
          <circle cx="18" cy="16.5" r="1.6" fill={GREEN} />
          {/* Center */}
          <circle cx="14" cy="14" r="2"   fill="none" stroke="rgba(0,255,136,0.4)" strokeWidth=".75" />
          <circle cx="14" cy="14" r="0.8" fill={GREEN} />
        </svg>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{
            color: GREEN, fontSize: 13, fontWeight: "bold",
            letterSpacing: ".12em", lineHeight: 1,
            fontFamily: "'Courier New', monospace",
             
            textShadow: "0 0 8px rgba(0,255,136,0.6)",
          }}>
            TRUST
            <span style={{ color: CYAN, textShadow: "0 0 8px rgba(0,238,255,0.7)" }}>CHAIN</span>
          </span>
          <span style={{
            color: "rgba(0,255,136,0.3)", fontSize: 6,
            letterSpacing: ".25em", textTransform: "uppercase", lineHeight: 1,
          }}>
            SECURED NETWORK
          </span>
        </div>
      </div>

      {/* Dot divider */}
      <div style={{
        width: 3, height: 3, borderRadius: "50%",
        background: "rgba(0,255,136,0.25)", flexShrink: 0,
      }} />

      {/* Contact Us */}
      <a
        ref={contactRef}
        href="mailto:contact@trustchain.io"
        style={{
          color: "rgba(0,255,136,0.55)",
          fontSize: 8, letterSpacing: ".18em",
          textTransform: "uppercase", textDecoration: "none",
          fontFamily: "'Courier New', monospace",
          padding: "4px 10px",
          border: "1px solid rgba(0,255,136,0.2)",
          borderRadius: 2, background: "transparent",
          transition: "color .2s, text-shadow .2s, letter-spacing .2s, border-color .2s, background .2s, box-shadow .2s",
          cursor: "pointer", flexShrink: 0,
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        CONTACT US
      </a>

      {/* Right separator */}
      <div style={{
        width: 1, height: 32, flexShrink: 0,
        background: "linear-gradient(to bottom, transparent, rgba(0,255,136,0.2), transparent)",
      }} />
    </div>
  );
}

// ── StatPanel ────────────────────────────────────────────────────────────────
function StatPanel({ children, accentColor = GREEN, style = {} }) {
  const ref = useRef(null);
  const base = {
    display: "flex", flexDirection: "column", lineHeight: 1.15,
    padding: "0 13px", cursor: "pointer", position: "relative",
    zIndex: 3, transition: "transform .15s", ...style,
  };
  const onEnter = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translateY(-1px)";
    const ov = ref.current.querySelector(".stat-hover-ov");
    if (ov) {
      ov.style.borderColor = hexAlpha(accentColor, 0.38);
      ov.style.boxShadow   = `0 0 18px ${hexAlpha(accentColor, 0.12)}, inset 0 0 10px ${hexAlpha(accentColor, 0.05)}`;
      ov.style.background  = hexAlpha(accentColor, 0.04);
    }
    const val = ref.current.querySelector(".stat-val");
    if (val) val.style.textShadow = `0 0 16px ${accentColor}, 0 0 30px ${hexAlpha(accentColor, 0.5)}`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "";
    const ov = ref.current.querySelector(".stat-hover-ov");
    if (ov) { ov.style.borderColor = "transparent"; ov.style.boxShadow = "none"; ov.style.background = "transparent"; }
    const val = ref.current.querySelector(".stat-val");
    if (val) val.style.textShadow = `0 0 8px ${accentColor}`;
  };
  return (
    <div ref={ref} style={base} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="stat-hover-ov" style={{
        position: "absolute", inset: "-6px -8px", borderRadius: 4,
        border: "1px solid transparent",
        transition: "border-color .2s, box-shadow .2s, background .2s",
        pointerEvents: "none",
      }} />
      {children}
    </div>
  );
}

function StatVal({ valRef, color, children }) {
  return (
    <span ref={valRef} className="stat-val" style={{
      color, fontSize: 14, fontWeight: "bold",
      textShadow: `0 0 8px ${color}`, transition: "text-shadow .3s",
    }}>
      {children}
    </span>
  );
}

// ── HexTicker ────────────────────────────────────────────────────────────────
function HexTicker() {
  const ref = useRef(null);
  useEffect(() => {
    const CHARS = "0123456789abcdef";
    const rndHex = () => "0x" + Array.from({ length: 8 }, () => CHARS[Math.floor(Math.random() * 16)]).join("");
    const glitch = () => {
      if (!ref.current) return;
      let frames = 0;
      const id = setInterval(() => {
        if (!ref.current) { clearInterval(id); return; }
        ref.current.style.color      = "#ff00ff";
        ref.current.style.textShadow = "0 0 12px #ff00ff, 2px 0 0 rgba(0,238,255,0.8), -2px 0 0 rgba(255,0,100,0.8)";
        ref.current.textContent =
          "0x" + Array.from({ length: 8 }, () =>
            Math.random() > 0.5 ? CHARS[Math.floor(Math.random() * 16)]
            : String.fromCharCode(33 + Math.floor(Math.random() * 30))
          ).join("");
        frames++;
        if (frames > 4) {
          clearInterval(id);
          if (!ref.current) return;
          ref.current.textContent      = rndHex();
          ref.current.style.color      = "rgba(0,238,255,0.75)";
          ref.current.style.textShadow = "0 0 6px rgba(0,238,255,0.5)";
        }
      }, 60);
    };
    const id = setInterval(glitch, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <span ref={ref} style={{
      color: "rgba(0,238,255,0.75)", fontSize: 11, fontWeight: "bold",
      fontFamily: "'Courier New', monospace",
      textShadow: "0 0 6px rgba(0,238,255,0.5)",
      letterSpacing: ".04em", transition: "color .1s",
    }}>0x3f8a1c2d</span>
  );
}

// ── ChainNodes ────────────────────────────────────────────────────────────────
function ChainNodes() {
  const dotRefs = useRef([]);
  const stepRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      dotRefs.current.forEach((d, i) => {
        if (!d) return;
        const active = i === stepRef.current;
        const trail1 = i === (stepRef.current - 1 + 8) % 8;
        const trail2 = i === (stepRef.current - 2 + 8) % 8;
        if (!d.dataset.hovered || d.dataset.hovered === "0") {
          d.style.opacity   = active ? "1" : trail1 ? "0.5" : trail2 ? "0.2" : "0.08";
          d.style.transform = active ? "scale(1.8)" : trail1 ? "scale(1.2)" : "scale(1)";
          d.style.boxShadow = active ? "0 0 12px #00ff88, 0 0 24px rgba(0,255,136,0.4)" : trail1 ? "0 0 6px #00ff88" : "none";
        }
      });
      stepRef.current = (stepRef.current + 1) % 8;
    }, 200);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 13px" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div
            ref={el => dotRefs.current[i] = el}
            data-hovered="0"
            onMouseEnter={e => {
              e.currentTarget.dataset.hovered = "1";
              e.currentTarget.style.opacity   = "1";
              e.currentTarget.style.transform = "scale(2.2)";
              e.currentTarget.style.boxShadow = "0 0 16px #00ff88, 0 0 32px rgba(0,255,136,0.5)";
            }}
            onMouseLeave={e => { e.currentTarget.dataset.hovered = "0"; }}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: GREEN, flexShrink: 0, opacity: 0.08,
              transition: "opacity .1s, transform .1s, box-shadow .1s",
              cursor: "pointer",
            }}
          />
          {i < 7 && <div style={{ width: 8, height: 1, background: "rgba(0,255,136,0.12)" }} />}
        </div>
      ))}
    </div>
  );
}

// ── LiveDot ───────────────────────────────────────────────────────────────────
function LiveDot({ dotRef }) {
  return (
    <div style={{ padding: "0 0 0 13px", display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ position: "relative", width: 10, height: 10 }}>
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: "1px solid rgba(0,255,136,0.4)",
          animation: "footerRipple1 2s ease-out infinite",
        }} />
        <div style={{
          position: "absolute", inset: -8, borderRadius: "50%",
          border: "1px solid rgba(0,255,136,0.15)",
          animation: "footerRipple2 2s ease-out infinite .6s",
        }} />
        <div ref={dotRef} style={{
          width: 10, height: 10, borderRadius: "50%",
          background: GREEN, boxShadow: `0 0 8px ${GREEN}`,
        }} />
      </div>
      <span style={{ color: GREEN, fontSize: 7, letterSpacing: ".18em", textTransform: "uppercase" }}>
        LIVE
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const FooterHome = forwardRef(function FooterHome(_, ref) {
  const canvasRef   = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const rafRef      = useRef(null);
  const beltRef     = useRef(0);
  const scanRef     = useRef(0);
  const sparksRef   = useRef(makeSparks(35));
  const matrixRef   = useRef(makeMatrixCols());
  const burstsRef   = useRef([]);
  const mouseRef    = useRef({ x: -999, y: -999 });
  const footerRef   = useRef(null);
  const elRefs      = useRef({});
  const verRef      = useRef(247);
  const penRef      = useRef(31);
  const blockRef    = useRef(1848);

  const boxesRef = useRef([
    { x: 80,  v: true  },
    { x: 220, v: false },
    { x: 360, v: true  },
    { x: 500, v: true  },
    { x: 640, v: false },
  ]);

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById("footer-home-kf")) return;
    const style = document.createElement("style");
    style.id = "footer-home-kf";
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  // ── Draw ─────────────────────────────────────────────────────────────────────
  const draw = useCallback((dt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    const { x: mX, y: mY } = mouseRef.current;

    c.clearRect(0, 0, W, H);
    c.fillStyle = "#050f0a";
    c.fillRect(0, 0, W, H);

    // Grid
    c.strokeStyle = "rgba(0,255,136,0.035)"; c.lineWidth = 0.5;
    for (let x = 0; x < W; x += 28) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }
    for (let y = 0; y < H; y += 16) { c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }

    // Matrix rain
    c.font = "9px Courier New";
    matrixRef.current.forEach(col => {
      col.y += col.speed * dt;
      if (col.y > H + 20) { col.y = -20; col.brightness = 0.03 + Math.random() * 0.07; }
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      c.textAlign = "center";
      c.fillStyle = `rgba(0,255,136,${col.brightness.toFixed(3)})`;
      c.fillText(ch, col.x, col.y);
      c.fillStyle = `rgba(0,255,136,${(col.brightness * 0.4).toFixed(3)})`;
      c.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], col.x, col.y - 10);
    });

    // Mouse energy field
    if (mX > 0) {
      const mg = c.createRadialGradient(mX, mY, 0, mX, mY, 80);
      mg.addColorStop(0, "rgba(0,255,136,0.08)"); mg.addColorStop(1, "rgba(0,255,136,0)");
      c.fillStyle = mg; c.fillRect(0, 0, W, H);
    }

    // Dual scanlines
    scanRef.current = (scanRef.current + dt * 95) % (W + 80);
    const sx = scanRef.current - 40;
    const sg = c.createLinearGradient(sx-50, 0, sx+50, 0);
    sg.addColorStop(0,"rgba(0,255,136,0)"); sg.addColorStop(0.45,"rgba(0,255,136,0.05)");
    sg.addColorStop(0.5,"rgba(0,255,136,0.18)"); sg.addColorStop(0.55,"rgba(0,255,136,0.05)");
    sg.addColorStop(1,"rgba(0,255,136,0)");
    c.fillStyle = sg; c.fillRect(sx-50, 0, 100, H);
    c.strokeStyle = "rgba(0,255,136,0.3)"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(sx,0); c.lineTo(sx,H); c.stroke();
    const sx2 = ((scanRef.current + 200) % (W + 80)) - 40;
    c.strokeStyle = "rgba(0,238,255,0.08)";
    c.beginPath(); c.moveTo(sx2,0); c.lineTo(sx2,H); c.stroke();

    // Sparks
    sparksRef.current.forEach(s => {
      s.life += dt;
      if (s.life > s.maxLife) {
        s.x = Math.random()*W; s.y = Math.random()*H;
        s.vx = (Math.random()-0.5)*22; s.vy = (Math.random()-0.5)*8;
        s.life = 0; s.maxLife = 0.5+Math.random()*1.4;
        s.col = Math.random()>0.5 ? "rgba(0,255,136," : "rgba(0,238,255,";
      }
      s.x += s.vx*dt; s.y += s.vy*dt;
      const a = Math.sin((s.life/s.maxLife)*Math.PI)*0.8;
      c.beginPath(); c.arc(s.x, s.y, 1.2, 0, Math.PI*2);
      c.fillStyle = s.col+a.toFixed(2)+")"; c.fill();
    });

    // Bursts
    for (let i = burstsRef.current.length-1; i >= 0; i--) {
      const b = burstsRef.current[i];
      b.life += dt;
      if (b.life > b.maxLife) { burstsRef.current.splice(i,1); continue; }
      b.x += b.vx*dt; b.y += b.vy*dt; b.vx *= 0.92; b.vy *= 0.92;
      const a = 1 - b.life/b.maxLife;
      c.beginPath(); c.arc(b.x, b.y, 2*a, 0, Math.PI*2);
      c.fillStyle = b.col === GREEN ? `rgba(0,255,136,${a})` : `rgba(0,238,255,${a})`; c.fill();
    }

    // Belt
    const bY = H-26, bH = 22;
    const beltGlow = c.createLinearGradient(0,bY-5,0,bY+bH+5);
    beltGlow.addColorStop(0,"rgba(0,255,136,0.15)"); beltGlow.addColorStop(0.5,"rgba(0,255,136,0.04)");
    beltGlow.addColorStop(1,"rgba(0,255,136,0)");
    c.fillStyle = beltGlow; c.fillRect(0,bY-5,W,bH+10);
    c.fillStyle = "#080f0c"; c.fillRect(0,bY,W,bH);
    beltRef.current = (beltRef.current + dt*SPEED) % 20;
    c.strokeStyle = "rgba(0,255,136,0.07)"; c.lineWidth = 1;
    for (let x = -beltRef.current; x < W+20; x += 20) { c.beginPath(); c.moveTo(x,bY); c.lineTo(x,bY+bH); c.stroke(); }
    [bY, bY+bH].forEach(ry => {
      c.shadowColor = GREEN; c.shadowBlur = 5;
      c.strokeStyle = "rgba(0,255,136,0.55)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0,ry); c.lineTo(W,ry); c.stroke();
      c.shadowBlur = 0;
    });

    // Rollers
    [[12,bY+bH/2],[W-12,bY+bH/2]].forEach(([rx,ry]) => {
      c.beginPath(); c.arc(rx,ry,10,0,Math.PI*2);
      const rg = c.createRadialGradient(rx-2,ry-2,1,rx,ry,10);
      rg.addColorStop(0,"#1a3a28"); rg.addColorStop(1,"#050f0a");
      c.fillStyle = rg; c.fill();
      c.strokeStyle = "rgba(0,255,136,0.35)"; c.lineWidth = 1; c.stroke();
      c.beginPath(); c.arc(rx,ry,3,0,Math.PI*2);
      c.fillStyle = "rgba(0,255,136,0.5)"; c.fill();
      c.beginPath(); c.arc(rx,ry,10,-Math.PI*0.3,Math.PI*0.1);
      c.strokeStyle = "rgba(0,255,136,0.2)"; c.lineWidth = 2; c.stroke();
    });

    // Boxes
    boxesRef.current.forEach(b => {
      b.x -= dt*SPEED;
      if (b.x < -30) b.x += W+70;
      const col  = b.v ? GREEN : AMBER;
      const col2 = b.v ? "rgba(0,255,136," : "rgba(255,170,0,";
      const bg   = b.v ? "#061a0e" : "#1a0e00";
      const bx   = b.x-13, by = bY-15, sz = 24;
      const proximity = Math.max(0, 1-Math.hypot(mX-b.x, mY-(by+sz/2))/80);
      c.shadowColor = col; c.shadowBlur = 14+proximity*20;
      c.strokeStyle = col2+(0.12+proximity*0.25)+")"; c.lineWidth = 7;
      c.strokeRect(bx-4,by-4,sz+8,sz+8); c.shadowBlur = 0;
      const bg2 = c.createLinearGradient(bx,by,bx+sz,by+sz);
      bg2.addColorStop(0,bg); bg2.addColorStop(1,"#000");
      c.fillStyle = bg2; c.fillRect(bx,by,sz,sz);
      if (proximity > 0.2) {
        const sh = c.createLinearGradient(bx,by,bx+sz,by+sz);
        sh.addColorStop(0,col2+(0.15*proximity)+")"); sh.addColorStop(1,"rgba(0,0,0,0)");
        c.fillStyle = sh; c.fillRect(bx,by,sz,sz);
      }
      const bk = 6; c.strokeStyle = col; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(bx,by+bk); c.lineTo(bx,by); c.lineTo(bx+bk,by); c.stroke();
      c.beginPath(); c.moveTo(bx+sz-bk,by); c.lineTo(bx+sz,by); c.lineTo(bx+sz,by+bk); c.stroke();
      c.beginPath(); c.moveTo(bx,by+sz-bk); c.lineTo(bx,by+sz); c.lineTo(bx+bk,by+sz); c.stroke();
      c.beginPath(); c.moveTo(bx+sz-bk,by+sz); c.lineTo(bx+sz,by+sz); c.lineTo(bx+sz,by+sz-bk); c.stroke();
      c.shadowColor = col; c.shadowBlur = 8+proximity*12;
      c.fillStyle = col2+(0.75+proximity*0.25)+")"; c.fillRect(bx,by-3,sz,3); c.shadowBlur = 0;
      c.shadowColor = col; c.shadowBlur = 10+proximity*15;
      c.fillStyle = col; c.font = "bold 11px 'Courier New'"; c.textAlign = "center";
      c.fillText(b.v ? "✓" : "?", b.x, by+16); c.shadowBlur = 0;
    });

    // Edge fades
    const fadeW = 40;
    const gL = c.createLinearGradient(0,0,fadeW,0);
    gL.addColorStop(0,"#050f0a"); gL.addColorStop(1,"rgba(5,15,10,0)");
    c.fillStyle = gL; c.fillRect(0,0,fadeW,H);
    const gR = c.createLinearGradient(W-fadeW,0,W,0);
    gR.addColorStop(0,"rgba(5,15,10,0)"); gR.addColorStop(1,"#050f0a");
    c.fillStyle = gR; c.fillRect(W-fadeW,0,fadeW,H);
  }, []);

  const pulseDot = useCallback((now) => {
    const dot = elRefs.current.dot;
    if (!dot) return;
    const v = 0.3 + 0.7*(0.5+0.5*Math.sin(now*0.004));
    dot.style.opacity   = v.toFixed(3);
    dot.style.boxShadow = `0 0 ${(6+10*v).toFixed(1)}px ${GREEN}, 0 0 ${(14+20*v).toFixed(1)}px rgba(0,255,136,0.3)`;
  }, []);

  const tick = useCallback((now = performance.now()) => {
    const dt = Math.min((now-lastTimeRef.current)/1000, 0.05);
    lastTimeRef.current = now;
    draw(dt); pulseDot(now);
  }, [draw, pulseDot]);

  useImperativeHandle(ref, () => ({ tick }), [tick]);

  useEffect(() => {
    let alive = true;
    const loop = (now) => { if (!alive) return; tick(now); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const onMove  = e => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX-r.left, y: e.clientY-r.top }; };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => { canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseleave", onLeave); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const onClick = e => {
      const r = canvas.getBoundingClientRect();
      const cx = e.clientX-r.left, cy = e.clientY-r.top;
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI*2*i)/20;
        burstsRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle)*(30+Math.random()*50),
          vy: Math.sin(angle)*(20+Math.random()*30),
          life: 0, maxLife: 0.5+Math.random()*0.4,
          col: Math.random()>0.4 ? GREEN : CYAN,
        });
      }
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const flash = el => {
      if (!el) return;
      el.style.animation = "none"; void el.offsetWidth;
      el.style.animation = "footerValueFlash .25s ease-out";
    };
    const id = setInterval(() => {
      const { ver, pen, blk, tx } = elRefs.current;
      if (Math.random() < 0.65) {
        verRef.current++; penRef.current = Math.max(0, penRef.current-1);
        if (ver) { ver.textContent = pad4(verRef.current); flash(ver); }
        if (pen) { pen.textContent = pad4(penRef.current); flash(pen); }
      }
      blockRef.current++;
      if (blk) { blk.textContent = blockRef.current.toLocaleString(); flash(blk); }
      if (tx)  { tx.textContent  = (3.6+Math.random()*2.2).toFixed(1); flash(tx); }
    }, 1600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = footerRef.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(8px)";
    el.style.transition = "opacity .6s ease, transform .6s ease";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
    }));
  }, []);

  return (
    <div ref={footerRef} style={S.footer}>
      <canvas ref={canvasRef} width={W} height={H} style={S.canvas} />
      <div style={S.scanlineOverlay} />

      {/* ── Left panel ── */}
      <div style={S.side}>
        <StatPanel accentColor={CYAN} style={{ padding: "0 13px 0 0", minWidth: 120 }}>
          <span style={S.lbl}>LAST HASH</span>
          <HexTicker />
        </StatPanel>
        <div style={S.divider} />

        <StatPanel accentColor={GREEN}>
          <span style={S.lbl}>VERIFIED</span>
          <StatVal valRef={el => elRefs.current.ver = el} color={GREEN}>{pad4(247)}</StatVal>
        </StatPanel>
        <div style={S.divider} />

        <StatPanel accentColor={AMBER}>
          <span style={S.lbl}>PENDING</span>
          <StatVal valRef={el => elRefs.current.pen = el} color={AMBER}>{pad4(31)}</StatVal>
        </StatPanel>
        <div style={S.divider} />

        <StatPanel accentColor={CYAN}>
          <span style={S.lbl}>BLOCKS</span>
          <StatVal valRef={el => elRefs.current.blk = el} color={CYAN}>1,848</StatVal>
        </StatPanel>
      </div>

      {/* ── Center: TrustChain brand + Contact Us ── */}
      <TrustChainCenter />

      {/* ── Right panel ── */}
      <div style={S.side}>
        <StatPanel accentColor={GREEN}>
          <span style={S.lbl}>TX/SEC</span>
          <StatVal valRef={el => elRefs.current.tx = el} color={GREEN}>4.2</StatVal>
        </StatPanel>
        <div style={S.divider} />

        <ChainNodes />
        <div style={S.divider} />

        <LiveDot dotRef={el => elRefs.current.dot = el} />
      </div>
    </div>
  );
});

export default FooterHome;
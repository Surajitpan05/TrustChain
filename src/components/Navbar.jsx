import { useState, useEffect, useRef } from "react";
import { S } from "../styles/index.js";
import { Link, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home",      to: "/" },
  { label: "Admin",     to: "/admin" },
];

export default function Navbar() {
  const navigate   = useNavigate();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const wrapperRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  /* shrink on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);
  const handleVerify = () => { close(); navigate("/product/TC001"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono:wght@400;700&display=swap');

        .tc-nav-wrap * { box-sizing: border-box; }

        /* ── nav bar ── */
        .tc-nav-bar {
          transition: padding 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
        }
        .tc-nav-bar.scrolled {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          box-shadow: 0 4px 40px rgba(0,200,100,0.07) !important;
        }

        /* ── logo ── */
        .tc-logo-mark {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 1.05rem;
          color: #e8fff4;
          letter-spacing: 0.06em;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .tc-logo-mark:hover { color: #00c864; }

        .tc-logo-hex {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .tc-logo-hex svg { display: block; }

        .tc-logo-sub {
          font-family: 'Space Mono', monospace;
          font-size: 0.52rem;
          letter-spacing: 0.22em;
          color: rgba(0,200,100,0.55);
          text-transform: uppercase;
          margin-top: 3px;
          padding-left: 35px;
        }

        /* ── nav links ── */
        .tc-nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .tc-nav-link {
          font-family: 'Space Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(180,230,210,0.55);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 2px;
          position: relative;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tc-nav-link::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 2px;
          background: rgba(0,200,100,0.0);
          transition: background 0.2s;
        }
        .tc-nav-link:hover { color: #00c864; }
        .tc-nav-link:hover::before { background: rgba(0,200,100,0.07); }

        .tc-nav-link-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00c864;
          opacity: 0;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .tc-nav-link:hover .tc-nav-link-dot { opacity: 1; }

        /* ── divider ── */
        .tc-nav-divider {
          width: 1px;
          height: 18px;
          background: rgba(0,200,100,0.15);
          margin: 0 8px;
        }

        /* ── verify button ── */
        .tc-verify-btn {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #010804;
          background: #00c864;
          border: none;
          border-radius: 2px;
          padding: 9px 18px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }
        .tc-verify-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .tc-verify-btn:hover { background: #00e070; }
        .tc-verify-btn:hover::after { background: rgba(255,255,255,0.06); }
        .tc-verify-btn:active { transform: scale(0.97); }

        .tc-verify-arrow {
          display: flex;
          align-items: center;
          transition: transform 0.2s;
        }
        .tc-verify-btn:hover .tc-verify-arrow { transform: translateX(3px); }

        /* ── status chip ── */
        .tc-status-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          color: rgba(0,200,100,0.7);
          text-transform: uppercase;
          border: 1px solid rgba(0,200,100,0.18);
          border-radius: 2px;
          padding: 5px 10px;
          margin-right: 6px;
        }
        .tc-status-blink {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00c864;
          box-shadow: 0 0 8px #00c864;
          animation: navBlink 1.4s infinite;
          flex-shrink: 0;
        }
        @keyframes navBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* ── hamburger ── */
        .tc-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(0,200,100,0.22);
          border-radius: 2px;
          background: transparent;
          cursor: pointer;
          padding: 0;
          transition: border-color 0.2s, background 0.2s;
        }
        .tc-hamburger:hover {
          border-color: rgba(0,200,100,0.5);
          background: rgba(0,200,100,0.06);
        }
        .tc-hamburger span {
          display: block;
          width: 16px;
          height: 1px;
          background: #00c864;
          border-radius: 1px;
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
        }
        .tc-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .tc-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .tc-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        /* ── mobile drawer ── */
        .tc-mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
          background: rgba(1,8,4,0.97);
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 80px 40px 40px;
          transform: translateX(-100%);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
          pointer-events: none;
        }
        .tc-mobile-drawer.open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: all;
        }

        .tc-mobile-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,200,100,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,100,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .tc-mobile-link {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 2rem;
          color: rgba(232,255,244,0.5);
          text-decoration: none;
          letter-spacing: -0.02em;
          line-height: 1.15;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }
        .tc-mobile-link:hover { color: #00c864; }

        .tc-mobile-link-num {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          color: rgba(0,200,100,0.4);
          letter-spacing: 0.2em;
          align-self: flex-start;
          margin-top: 6px;
        }

        .tc-mobile-divider {
          width: 60px;
          height: 1px;
          background: rgba(0,200,100,0.2);
          margin: 20px 0;
          position: relative;
          z-index: 1;
        }

        .tc-mobile-verify {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #010804;
          background: #00c864;
          border: none;
          border-radius: 2px;
          padding: 12px 24px;
          cursor: pointer;
          margin-top: 32px;
          position: relative;
          z-index: 1;
          transition: background 0.2s;
        }
        .tc-mobile-verify:hover { background: #00e070; }

        .tc-mobile-footer {
          position: absolute;
          bottom: 32px;
          left: 40px;
          font-family: 'Space Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.22em;
          color: rgba(0,200,100,0.3);
          text-transform: uppercase;
          z-index: 1;
        }

        /* ── corner accents on mobile drawer ── */
        .tc-mobile-corner-tl {
          position: absolute;
          top: 24px; left: 24px;
          width: 24px; height: 24px;
          border-top: 1px solid rgba(0,200,100,0.3);
          border-left: 1px solid rgba(0,200,100,0.3);
        }
        .tc-mobile-corner-br {
          position: absolute;
          bottom: 24px; right: 24px;
          width: 24px; height: 24px;
          border-bottom: 1px solid rgba(0,200,100,0.3);
          border-right: 1px solid rgba(0,200,100,0.3);
        }

        /* ── responsive ── */
        @media (max-width: 720px) {
          .tc-nav-links, .tc-nav-divider, .tc-status-chip, .tc-verify-btn { display: none !important; }
          .tc-hamburger { display: flex !important; }
        }
      `}</style>

      <div ref={wrapperRef} className="tc-nav-wrap">

        {/* ── Main bar ── */}
        <nav
          className={`tc-nav-bar${scrolled ? " scrolled" : ""}`}
          style={{
            ...S.nav,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Logo */}
          <div
            style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
            onClick={() => { close(); navigate("/"); }}
          >
            <div className="tc-logo-mark">
              <span className="tc-logo-hex">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path
                    d="M13 2L23.39 8V18L13 24L2.61 18V8L13 2Z"
                    stroke="#00c864"
                    strokeWidth="1"
                    fill="rgba(0,200,100,0.08)"
                  />
                  <path
                    d="M13 7L18.5 10.25V16.75L13 20L7.5 16.75V10.25L13 7Z"
                    stroke="#00c864"
                    strokeWidth="0.6"
                    fill="rgba(0,200,100,0.12)"
                  />
                </svg>
              </span>
              TrustChain
            </div>
            <div className="tc-logo-sub">Supply Chain Verification</div>
          </div>

          {/* Links */}
          <ul className="tc-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="tc-nav-link"
                  onClick={close}
                >
                  <span className="tc-nav-link-dot" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="tc-status-chip">
              <span className="tc-status-blink" />
              Live · Mainnet
            </div>
            <div className="tc-nav-divider" />
            <button className="tc-verify-btn" onClick={handleVerify}>
              Verify Product
              <span className="tc-verify-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="#010804" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
                </svg>
              </span>
            </button>

            {/* Hamburger */}
            <button
              className={`tc-hamburger${open ? " open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* ── Mobile full-screen drawer ── */}
        <div className={`tc-mobile-drawer${open ? " open" : ""}`}>
          <div className="tc-mobile-grid-bg" />
          <div className="tc-mobile-corner-tl" />
          <div className="tc-mobile-corner-br" />

          {NAV_LINKS.map((l, i) => (
            <div key={l.to}>
              <Link to={l.to} className="tc-mobile-link" onClick={close}>
                <span className="tc-mobile-link-num">0{i + 1}</span>
                {l.label}
              </Link>
              {i < NAV_LINKS.length - 1 && <div className="tc-mobile-divider" />}
            </div>
          ))}

          <button className="tc-mobile-verify" onClick={handleVerify}>
            ▸ &nbsp;Verify Product
          </button>

          <div className="tc-mobile-footer">
            TrustChain · Supply Chain Verification Protocol
          </div>
        </div>
      </div>
    </>
  );
}
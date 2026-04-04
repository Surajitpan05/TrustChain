export default function FooterHome({ version = "v1.0.0" }) {
  return (
    <>
      <style>{`
        /* ── Footer ── */
        .tc-footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(0,200,100,0.15);
          background: #030f07;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tc-footer-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .tc-footer-brand {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 900;
          color: rgba(255,255,255,0.4);
          letter-spacing: 2px;
        }

        .tc-footer-sep {
          width: 1px;
          height: 14px;
          background: rgba(0,200,100,0.15);
        }

        .tc-footer-meta {
          font-size: 9px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.8px;
        }

        .tc-footer-link {
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Space Mono', monospace;
          padding: 0;
          transition: color .18s;
        }

        .tc-footer-link:hover {
          color: rgba(0,200,100,0.8);
        }

        .tc-footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tc-net-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00e872;
          animation: blink 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .tc-net-label {
          font-size: 9px;
          letter-spacing: 1.5px;
          color: rgba(0,200,100,0.55);
          text-transform: uppercase;
        }

        .tc-block-pill {
          font-size: 9px;
          letter-spacing: 0.8px;
          color: rgba(226,244,232,0.3);
          background: rgba(0,200,100,0.06);
          border: 1px solid rgba(0,200,100,0.12);
          border-radius: 2px;
          padding: 3px 8px;
        }

        @keyframes blink {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tc-footer {
            padding: 14px;
          }

          .tc-footer-left {
            gap: 12px;
          }

          .tc-footer-sep {
            display: none;
          }
        }
      `}</style>

      <footer className="tc-footer">
        
        {/* Left Section */}
        <div className="tc-footer-left">
          <span className="tc-footer-brand">TrustChain</span>

          <div className="tc-footer-sep" />
          <span className="tc-footer-meta">
            AI Powered · Blockchain Verified · Secure Platform
          </span>

          <div className="tc-footer-sep" />
          <button className="tc-footer-link">About</button>
          <button className="tc-footer-link">Features</button>
          <button className="tc-footer-link">Contact</button>
          <button className="tc-footer-link">Docs</button>
          <button className="tc-footer-link">Privacy</button>
          <button className="tc-footer-link">Terms</button>

          <div className="tc-footer-sep" />
          <span className="tc-footer-meta">© 2026 TrustChain</span>
        </div>

        {/* Right Section */}
        <div className="tc-footer-right">
          <div className="tc-net-dot" />
          <span className="tc-net-label">Secure Network</span>

          <div className="tc-footer-sep" />
          <span className="tc-block-pill">Home</span>

          <div className="tc-footer-sep" />
          <span className="tc-block-pill">{version}</span>
        </div>

      </footer>
    </>
  );
}
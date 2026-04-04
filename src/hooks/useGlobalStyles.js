import { useEffect } from "react";

const KEYFRAMES = `
  @keyframes revealLine { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.12 } }
  @keyframes txPop { from { opacity:0; transform:translateX(10px) } to { opacity:1; transform:translateX(0) } }
  input::placeholder { color: rgba(0,255,136,0.18) }
  a:hover { color: rgba(0,255,136,0.9) !important }
`;

/**
 * Injects Google Fonts (Orbitron + Space Mono) and CSS keyframes once.
 * Idempotent — safe to call in multiple components.
 */
export function useGlobalStyles() {
  useEffect(() => {
    if (!document.getElementById("tc-font")) {
      const l = document.createElement("link");
      l.id = "tc-font";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("tc-kf")) {
      const s = document.createElement("style");
      s.id = "tc-kf";
      s.textContent = KEYFRAMES;
      document.head.appendChild(s);
    }
  }, []);
}
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
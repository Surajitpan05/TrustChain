import { useEffect, useRef } from "react";
import { buildScene } from "../scene/index.js";

/**
 * Mounts and tears down the Three.js scene tied to `canvasRef`.
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {Function} onTxEvent - Called each time a box is verified.
 */
export function useThreeScene(canvasRef, onTxEvent) {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    sceneRef.current = buildScene(canvasRef.current, onTxEvent);
    return () => sceneRef.current?.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
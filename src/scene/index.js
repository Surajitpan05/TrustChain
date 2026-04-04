import * as THREE from "three";
import { buildLights } from "./lights.js";
import { buildWarehouse } from "./warehouse.js";
import { buildEnvironment } from "./environment.js";
import { startAnimationLoop } from "./animationLoop.js";

/**
 * Initialises the Three.js renderer, scene, camera, and all sub-systems.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Function} onTxEvent - Callback: (message: string) => void
 * @returns {{ destroy: Function }}
 */
export function buildScene(canvas, onTxEvent) {
  let W = window.innerWidth, H = window.innerHeight;

  // ── Renderer ─────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // ── Scene & camera ────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020c08, 0.009);

  const cam = new THREE.PerspectiveCamera(54, W / H, 0.1, 300);
  cam.position.set(0, 14, 26);
  cam.lookAt(0, 1, 0);

  // ── Shared helpers ────────────────────────────────────────────────────────
  const M  = (c, r = 0.42, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const sh = o => { o.castShadow = true; o.receiveShadow = true; return o; };
  const mkMesh = (geo, mat, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, mat);
    o.position.set(px, py, pz);
    o.rotation.set(rx, ry, rz);
    sh(o);
    return o;
  };

  // ── Sub-systems ───────────────────────────────────────────────────────────
  const { glow, backFill, signLight } = buildLights(scene);

  const sg = buildWarehouse(M, sh, mkMesh);
  scene.add(sg);

  const envRefs = buildEnvironment(scene, M, sh, mkMesh);

  // ── Start loop ────────────────────────────────────────────────────────────
  const stopLoop = startAnimationLoop(
    { renderer, scene, cam, sg, ...envRefs, glow, backFill, signLight, M, sh },
    onTxEvent
  );

  // ── Resize handler ────────────────────────────────────────────────────────
  function handleResize() {
    W = window.innerWidth; H = window.innerHeight;
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    renderer.setSize(W, H);
  }
  window.addEventListener("resize", handleResize);

  return {
    destroy: () => {
      stopLoop();
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    },
  };
}
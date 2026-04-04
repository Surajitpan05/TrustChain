import * as THREE from "three";
import { BS } from "../constants/index.js";
import { makeWarehouseSign } from "../utils/textures.js";

/**
 * Builds and returns the full warehouse Group (walls, doors, pillars,
 * windows, sign, chimney stacks, label planes, loading dock).
 *
 * @param {Function} M  - Material factory: (color, roughness?, metalness?) => MeshStandardMaterial
 * @param {Function} sh - Shadow helper: (Object3D) => Object3D
 * @param {Function} mkMesh - Mesh factory: (geo, mat, px, py, pz, rx, ry, rz) => Mesh
 * @returns {THREE.Group}
 */
export function buildWarehouse(M, sh, mkMesh) {
  const sg = new THREE.Group();

  const addS = (geo, mat, x, y, z, rx = 0, ry = 0) => {
    const m = mkMesh(geo, mat, x, y, z, rx, ry);
    sg.add(m);
    return m;
  };

  // ── Body & roof ──────────────────────────────────────────────────────────
  addS(
    new THREE.BoxGeometry(6.2 * BS, 4.0 * BS, 3.4 * BS),
    new THREE.MeshStandardMaterial({ color: 0x081a10, roughness: 0.12, metalness: 0.7 }),
    0, 0.12 * BS, 0
  );
  addS(
    new THREE.BoxGeometry(6.5 * BS, 0.22 * BS, 3.7 * BS),
    new THREE.MeshStandardMaterial({ color: 0x061410, roughness: 0.2, metalness: 0.6 }),
    0, 2.14 * BS, 0
  );
  addS(
    new THREE.BoxGeometry(6.5 * BS, 0.16 * BS, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.1, metalness: 0.8, emissive: 0x00ff88, emissiveIntensity: 0.14 }),
    0, 2.28 * BS, 0
  );
  addS(new THREE.BoxGeometry(6.5 * BS, 0.12, 0.4), M(0x041008, 0.5, 0.3), 0, 2.12 * BS,  1.72 * BS);
  addS(new THREE.BoxGeometry(6.5 * BS, 0.12, 0.4), M(0x041008, 0.5, 0.3), 0, 2.12 * BS, -1.72 * BS);

  // ── Front windows (green) ────────────────────────────────────────────────
  for (let i = -2; i <= 2; i++) {
    const wm = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.04, metalness: 0.9, emissive: 0x00ff88, emissiveIntensity: 1.1 });
    addS(new THREE.BoxGeometry(0.5 * BS, 0.38 * BS, 0.07), wm, i * 1.0 * BS, 1.1 * BS,  1.71 * BS);
    addS(new THREE.BoxGeometry(0.56 * BS, 0.05, 0.14), M(0x041008, 0.6, 0.4), i * 1.0 * BS, 0.87 * BS, 1.73 * BS);
  }

  // ── Back windows (amber) ─────────────────────────────────────────────────
  for (let i = -2; i <= 2; i++) {
    const wm2 = new THREE.MeshStandardMaterial({ color: 0xffbb55, roughness: 0.05, metalness: 0.8, emissive: 0x442200, emissiveIntensity: 0.55 });
    addS(new THREE.BoxGeometry(0.5 * BS, 0.38 * BS, 0.07), wm2, i * 1.0 * BS, 1.1 * BS, -1.71 * BS);
  }

  // ── Pillars (front & back) ───────────────────────────────────────────────
  for (let i = -2; i <= 2; i++) {
    addS(new THREE.BoxGeometry(0.17 * BS, 4.0 * BS, 0.17),
      new THREE.MeshStandardMaterial({ color: 0x0a2018, roughness: 0.2, metalness: 0.7 }),
      i * 1.2 * BS, 0.12 * BS,  1.73 * BS);
    addS(new THREE.BoxGeometry(0.17 * BS, 4.0 * BS, 0.17),
      new THREE.MeshStandardMaterial({ color: 0x0a2018, roughness: 0.2, metalness: 0.7 }),
      i * 1.2 * BS, 0.12 * BS, -1.73 * BS);
  }

  // ── EXIT door — LEFT ─────────────────────────────────────────────────────
  const exitDoorMat = new THREE.MeshStandardMaterial({
    color: 0x00ff88, roughness: 0.08, emissive: 0x00ff88, emissiveIntensity: 1.3, metalness: 0.5,
  });
  addS(new THREE.BoxGeometry(0.08, 1.6 * BS, 1.2 * BS), exitDoorMat, -3.1 * BS, -0.18 * BS, 0);
  const agL = new THREE.CylinderGeometry(0.6 * BS, 0.6 * BS, 0.08, 20, 1, false, 0, Math.PI);
  agL.rotateZ(-Math.PI / 2);
  addS(agL, exitDoorMat, -3.1 * BS, 0.6 * BS, 0);
  const glowMatL = new THREE.MeshStandardMaterial({ color: 0x00ff99, emissive: 0x00ff99, emissiveIntensity: 2.4, roughness: 0.06 });
  addS(new THREE.BoxGeometry(0.08, 1.6 * BS + 1.2 * BS * 0.4, 0.08), glowMatL, -3.1 * BS, 0.12 * BS,  0.62 * BS);
  addS(new THREE.BoxGeometry(0.08, 1.6 * BS + 1.2 * BS * 0.4, 0.08), glowMatL, -3.1 * BS, 0.12 * BS, -0.62 * BS);

  // ── ENTRY door — RIGHT ───────────────────────────────────────────────────
  const entryDoorMat = new THREE.MeshStandardMaterial({
    color: 0xcc8822, roughness: 0.18, emissive: 0xaa5500, emissiveIntensity: 0.9, metalness: 0.35,
  });
  addS(new THREE.BoxGeometry(0.08, 1.6 * BS, 1.2 * BS), entryDoorMat, 3.1 * BS, -0.18 * BS, 0);
  const agR = new THREE.CylinderGeometry(0.6 * BS, 0.6 * BS, 0.08, 20, 1, false, 0, Math.PI);
  agR.rotateZ(Math.PI / 2);
  addS(agR, entryDoorMat, 3.1 * BS, 0.6 * BS, 0);
  const glowMatR = new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0xffaa44, emissiveIntensity: 1.6, roughness: 0.06 });
  addS(new THREE.BoxGeometry(0.08, 1.6 * BS + 1.2 * BS * 0.4, 0.08), glowMatR, 3.1 * BS, 0.12 * BS,  0.62 * BS);
  addS(new THREE.BoxGeometry(0.08, 1.6 * BS + 1.2 * BS * 0.4, 0.08), glowMatR, 3.1 * BS, 0.12 * BS, -0.62 * BS);

  // ── Sign panel + frame + canvas sign ────────────────────────────────────
  addS(
    new THREE.BoxGeometry(4.4 * BS, 0.75 * BS, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x000d07, roughness: 0.15, metalness: 0.8, emissive: 0x00ff88, emissiveIntensity: 0.07 }),
    0, 1.82 * BS, 1.74 * BS
  );
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1.9, roughness: 0.04 });
  addS(new THREE.BoxGeometry(4.4 * BS, 0.045, 0.13), frameMat, 0, 1.82 * BS + 0.375 * BS, 1.75 * BS);
  addS(new THREE.BoxGeometry(4.4 * BS, 0.045, 0.13), frameMat, 0, 1.82 * BS - 0.375 * BS, 1.75 * BS);
  sg.add(makeWarehouseSign(BS));

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

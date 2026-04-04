import * as THREE from "three";
import { BS, HASHES, STACK_X_FACTORS } from "../constants/index.js";
import { makePallet, makeForklift } from "./meshFactories.js";

/**
 * Builds all environment objects (floor, grid, conveyor belts, pallets,
 * forklift, worker, ambient particles, scan rings, smoke puffs, hex tags).
 *
 * Returns refs needed by the animation loop.
 */
export function buildEnvironment(scene, M, sh, mkMesh) {
  // ── Floor ──────────────────────────────────────────────────────────────
  scene.add(mkMesh(new THREE.PlaneGeometry(200, 70), M(0x020c06, 0.98), 0, -1.6, 0, -Math.PI / 2));

  const gr = new THREE.GridHelper(200, 100, 0x00ff88, 0x00ff88);
  gr.position.y = -1.595;
  gr.material.opacity = 0.06;
  gr.material.transparent = true;
  scene.add(gr);

  [-30, 30].forEach(x => {
    scene.add(mkMesh(
      new THREE.PlaneGeometry(0.15, 65),
      new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.28, roughness: 0.9 }),
      x, -1.59, 0, -Math.PI / 2, 0, Math.PI / 2
    ));
  });

  // ── Pallets & crates (left staging area) ───────────────────────────────
  [-1.4, 1.4].forEach(oz => {
    const p = makePallet(M, sh); p.position.set(-8.5, 0.06, oz * 2.2); scene.add(p);
    const p2 = makePallet(M, sh); p2.position.set(-8.5, 0.24, oz * 2.2); scene.add(p2);
    const stk = sh(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.8), M(0x0e2018, 0.35, 0.4)));
    stk.position.set(-8.5, 0.54, oz * 2.2); scene.add(stk);
  });

  // ── Pallets (right staging area) ───────────────────────────────────────
  [0.6, -0.6].forEach(oz => {
    const p = makePallet(M, sh); p.position.set(9, 0.06, oz * 2.0); scene.add(p);
  });

  // ── Forklift ────────────────────────────────────────────────────────────
  const forkl = makeForklift(M, sh);
  forkl.position.set(9, -0.6, 2.2);
  forkl.rotation.y = 0.4;
  scene.add(forkl);

  // ── Worker figure ───────────────────────────────────────────────────────
  const wkg = new THREE.Group();
  wkg.add(sh(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.7, 8), M(0x0e2018, 0.4, 0.3))));
  const wHead = sh(new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), M(0xd4a870, 0.6, 0.1)));
  wHead.position.y = 0.55; wkg.add(wHead);
  const wHat = sh(new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.1, 8),
    new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 0.28, roughness: 0.4 })
  ));
  wHat.position.y = 0.68; wkg.add(wHat);
  wkg.position.set(9.5, -0.9, -2.5);
  wkg.rotation.y = -0.6;
  scene.add(wkg);

  // ── Scan rings ──────────────────────────────────────────────────────────
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 3.2, roughness: 0.04,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.07, 12, 60), ringMat);
  ring.position.set(0, 0.9, 0); ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const ring2Mat = ringMat.clone(); ring2Mat.emissiveIntensity = 2.3;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 12, 40), ring2Mat);
  ring2.position.set(0, 1.9, 0);
  scene.add(ring2);

  const ring3Mat = ringMat.clone(); ring3Mat.emissiveIntensity = 1.5; ring3Mat.color.set(0x44ffaa);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.035, 8, 60), ring3Mat);
  ring3.position.set(0, 0.5, 0); ring3.rotation.x = Math.PI / 2;
  scene.add(ring3);

  // ── Scan plane ──────────────────────────────────────────────────────────
  const scanMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88, transparent: true, opacity: 0.13, side: THREE.DoubleSide,
  });
  const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), scanMat);
  scanPlane.rotation.x = -Math.PI / 2;
  scanPlane.position.set(0, 0.2, 0);
  scene.add(scanPlane);

  // ── Floating hex tags ────────────────────────────────────────────────────
  const blockParticles = [];
  for (let i = 0; i < 20; i++) {
    const pc = document.createElement("canvas"); pc.width = 120; pc.height = 40;
    const px = pc.getContext("2d");
    px.fillStyle = "rgba(0,255,136,0.82)";
    px.font = "bold 14px monospace";
    px.textAlign = "center";
    px.fillText(
      HASHES[i % HASHES.length] + ":" + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0").toUpperCase(),
      60, 28
    );
    const bp = new THREE.Mesh(
      new THREE.PlaneGeometry(0.88, 0.28),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    bp.position.set((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 3);
    bp.userData = { baseY: bp.position.y, spd: 0.005 + Math.random() * 0.008, phase: Math.random() * Math.PI * 2 };
    scene.add(bp);
    blockParticles.push(bp);
  }

  // ── Smoke puffs ──────────────────────────────────────────────────────────
  const smokePuffs = [];
  const stackXs = STACK_X_FACTORS.map(f => f * BS);
  for (let i = 0; i < 9; i++) {
    const sp = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x0a2018, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
    );
    sp.position.set(stackXs[i % 3], (2.9 + Math.random()) * BS, 0);
    sp.userData = {
      vy: 0.013 + Math.random() * 0.007,
      vx: (Math.random() - 0.5) * 0.006,
      life: Math.floor(Math.random() * 90),
      maxLife: 80 + Math.floor(Math.random() * 50),
    };
    scene.add(sp);
    smokePuffs.push(sp);
  }

  // ── Ambient star particles ────────────────────────────────────────────────
  const ptG = new THREE.BufferGeometry();
  const ptN = 280;
  const ptA = new Float32Array(ptN * 3);
  for (let i = 0; i < ptN; i++) {
    ptA[i * 3]     = (Math.random() - 0.5) * 100;
    ptA[i * 3 + 1] = Math.random() * 14 - 1.5;
    ptA[i * 3 + 2] = (Math.random() - 0.5) * 24;
  }
  ptG.setAttribute("position", new THREE.BufferAttribute(ptA, 3));
  scene.add(new THREE.Points(ptG, new THREE.PointsMaterial({
    color: 0x00ff88, size: 0.09, transparent: true, opacity: 0.32,
  })));

  // ── Conveyor belts ────────────────────────────────────────────────────────
  const BELT_W = 1.5, beltLen = 26;

  // Right belt (incoming / plain boxes)
  scene.add(mkMesh(new THREE.BoxGeometry(beltLen, 0.16, BELT_W), M(0x2a1808, 0.85, 0.2), 13, -1.53, 0));
  [BELT_W / 2 + 0.07, -BELT_W / 2 - 0.07].forEach(oz => {
    scene.add(mkMesh(new THREE.BoxGeometry(beltLen, 0.26, 0.12), M(0x1e1006, 0.8, 0.2), 13, -1.46, oz));
  });
  for (let i = 0; i < 22; i++) {
    scene.add(mkMesh(new THREE.CylinderGeometry(0.095, 0.095, BELT_W, 8), M(0x120a04, 0.8, 0.3), 2.5 + i * 1.12, -1.47, 0, 0, 0, Math.PI / 2));
  }

  // Left belt (verified / exit)
  scene.add(mkMesh(
    new THREE.BoxGeometry(beltLen, 0.16, BELT_W),
    new THREE.MeshStandardMaterial({ color: 0x062010, roughness: 0.7, metalness: 0.3, emissive: 0x00ff88, emissiveIntensity: 0.04 }),
    -13, -1.53, 0
  ));
  [BELT_W / 2 + 0.07, -BELT_W / 2 - 0.07].forEach(oz => {
    scene.add(mkMesh(new THREE.BoxGeometry(beltLen, 0.26, 0.12), M(0x041808, 0.7, 0.3), -13, -1.46, oz));
  });
  for (let i = 0; i < 22; i++) {
    scene.add(mkMesh(new THREE.CylinderGeometry(0.095, 0.095, BELT_W, 8), M(0x041808, 0.7, 0.35), -2.5 - i * 1.12, -1.47, 0, 0, 0, Math.PI / 2));
  }

  return { ring, ring2, ring3, ringMat, ring2Mat, ring3Mat, scanPlane, blockParticles, smokePuffs, stackXs, ptG, ptA, ptN, forkl, wkg };
}
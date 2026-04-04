import * as THREE from "three";
import { BS, PLAIN_COLS, VERI_COLS, TX_MSGS } from "../constants/index.js";
import { bez3 } from "../utils/math.js";
import { makeQR } from "../utils/textures.js";
import { makePlainBox, makeVerifiedBox } from "./meshFactories.js";
import { incomingPath, exitPath } from "./paths.js";

export function startAnimationLoop(refs, onTxEvent) {
  const {
    renderer, scene, cam,
    sg,
    ring, ring2, ring3, ringMat, ring2Mat, ring3Mat,
    scanPlane, blockParticles, smokePuffs, stackXs,
    ptG, ptA, ptN,
    forkl, wkg,
    glow, backFill, signLight,
    M, sh,
  } = refs;

  const QRS = [makeQR(0), makeQR(7), makeQR(13), makeQR(20), makeQR(31)];
  const state = { t: 0, spawnT: 0, verifyQueue: [] };
  const boxes = [];
  let txIdx = 0;
  let nextLane = 0;

  function spawnPlainBox() {
    const sz  = (0.82 + Math.random() * 0.36) * 1.9;   // bigger boxes
    const col = PLAIN_COLS[Math.floor(Math.random() * PLAIN_COLS.length)];
    const g   = makePlainBox(sz, col, M, sh);
    const lane = nextLane++ % 3;
    const path = incomingPath(lane);
    g.position.set(path[0].x, path[0].y, path[0].z);
    scene.add(g);
    boxes.push({ g, sz, type: "plain", phase: "incoming", t: 0, path, spd: 0.0038 + Math.random() * 0.0018, lane });
  }

  function spawnVerifiedBox(sz, lane) {
    const col  = VERI_COLS[Math.floor(Math.random() * VERI_COLS.length)];
    const g    = makeVerifiedBox(sz, col, M, sh, QRS);
    const path = exitPath(lane != null ? lane : nextLane++ % 3);
    g.position.set(path[0].x, path[0].y, path[0].z);
    scene.add(g);
    boxes.push({ g, sz, type: "verified", phase: "exiting", t: 0, path, spd: 0.0032 + Math.random() * 0.0018 });
    if (onTxEvent) onTxEvent(TX_MSGS[txIdx++ % TX_MSGS.length]);
  }

  // Pre-fill 6 boxes staggered along the path
  for (let i = 0; i < 6; i++) {
    spawnPlainBox();
    const b = boxes[boxes.length - 1];
    b.t = i * 0.09;
    const p = bez3(Math.min(b.t, 0.999), b.path[0], b.path[1], b.path[2], b.path[3]);
    b.g.position.set(p.x, p.y, p.z);
  }

  let rafId = null;

  function animate() {
    rafId = requestAnimationFrame(animate);
    state.t += 0.012;

    ring.rotation.z  += 0.036;
    ring2.rotation.z -= 0.052;
    ring3.rotation.z += 0.02;
    const pulse = 0.7 + Math.sin(state.t * 3) * 0.4;
    ringMat.emissiveIntensity  = pulse * 3.4;
    ring2Mat.emissiveIntensity = pulse * 2.5;
    ring3Mat.emissiveIntensity = pulse * 1.7;

    scanPlane.material.opacity = 0.05 + Math.sin(state.t * 2.3) * 0.07;
    scanPlane.position.y = -0.1 + Math.sin(state.t * 2.0) * 1.1;

    blockParticles.forEach(bp => {
      bp.position.y = bp.userData.baseY + Math.sin(state.t * bp.userData.spd * 80 + bp.userData.phase) * 0.5;
      bp.material.opacity = 0.22 + Math.sin(state.t * 1.3 + bp.userData.phase) * 0.38;
      bp.lookAt(cam.position);
    });

    smokePuffs.forEach(sp => {
      sp.userData.life++;
      const progress = sp.userData.life / sp.userData.maxLife;
      sp.position.x += sp.userData.vx;
      sp.position.y += sp.userData.vy * (1 - progress * 0.5);
      sp.scale.setScalar(1 + progress * 3);
      sp.material.opacity = 0.14 * (1 - progress);
      if (sp.userData.life >= sp.userData.maxLife) {
        const sx = stackXs[Math.floor(Math.random() * stackXs.length)];
        sp.position.set(sx, (2.85 + Math.random() * 0.3) * BS, 0);
        sp.userData.life = 0;
        sp.userData.maxLife = 75 + Math.floor(Math.random() * 55);
        sp.userData.vx = (Math.random() - 0.5) * 0.006;
        sp.scale.setScalar(1);
        sp.material.opacity = 0.14;
      }
    });
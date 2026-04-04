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

    sg.position.y = 0.3 + Math.sin(state.t * 0.6) * 0.038;
    sg.rotation.y = Math.sin(state.t * 0.2) * 0.01;
    glow.intensity      = 1.3 + Math.sin(state.t * 1.5) * 0.7;
    backFill.intensity  = 1.0 + Math.sin(state.t * 0.85) * 0.38;
    signLight.intensity = 2.8 + Math.sin(state.t * 2.0) * 1.6;
    forkl.position.y = -0.6 + Math.sin(state.t * 1.2) * 0.04;
    wkg.position.y   = -0.9 + Math.sin(state.t * 1.8) * 0.03;
    wkg.rotation.y   = -0.6 + Math.sin(state.t * 0.5) * 0.18;

    if (++state.spawnT >= 55) { spawnPlainBox(); state.spawnT = 0; }

    for (let i = state.verifyQueue.length - 1; i >= 0; i--) {
      state.verifyQueue[i].t--;
      if (state.verifyQueue[i].t <= 0) {
        spawnVerifiedBox(state.verifyQueue[i].sz, state.verifyQueue[i].lane);
        state.verifyQueue.splice(i, 1);
      }
    }

    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i], g = b.g;

      if (b.phase === "incoming") {
        b.t += b.spd;
        if (b.t >= 0.92) { b.phase = "entering"; b.enterFr = 0; continue; }
        const tc    = Math.min(b.t, 0.9999);
        const pos   = bez3(tc, b.path[0], b.path[1], b.path[2], b.path[3]);
        const ahead = bez3(Math.min(tc + 0.012, 0.9999), b.path[0], b.path[1], b.path[2], b.path[3]);
        g.position.set(pos.x, pos.y + Math.sin(state.t * 1.6 + b.t * 8) * 0.018, pos.z);
        g.rotation.y = Math.atan2(ahead.x - pos.x, ahead.z - pos.z);

      } else if (b.phase === "entering") {
        b.enterFr = (b.enterFr || 0) + 1;
        g.scale.setScalar(Math.max(1 - b.enterFr / 20, 0.01));
        if (b.enterFr >= 20) {
          scene.remove(g);
          boxes.splice(i, 1);
          state.verifyQueue.push({ sz: b.sz, t: 38, lane: b.lane });
          continue;
        }

      } else if (b.phase === "exiting") {
        b.t += b.spd;
        if (b.t >= 1.0) { scene.remove(g); boxes.splice(i, 1); continue; }
        const tc  = Math.min(b.t, 0.9999);
        const pos = bez3(tc, b.path[0], b.path[1], b.path[2], b.path[3]);
        g.position.set(pos.x, pos.y + Math.sin(state.t * 2 + b.t * 8) * 0.016, pos.z);
        // QR (+Z face) always rotated to face camera
        const dx = cam.position.x - pos.x;
        const dz = cam.position.z - pos.z;
        g.rotation.y = Math.atan2(dx, dz);
      }
    }

    for (let i = 0; i < ptN; i++) {
      ptA[i * 3 + 1] += 0.003;
      if (ptA[i * 3 + 1] > 10) ptA[i * 3 + 1] = -1.5;
    }
    ptG.attributes.position.needsUpdate = true;

    cam.position.x = Math.sin(state.t * 0.055) * 1.5;
    cam.position.z = 26 + Math.cos(state.t * 0.05) * 1.4;
    cam.position.y = 14 + Math.sin(state.t * 0.04) * 0.55;
    cam.lookAt(Math.sin(state.t * 0.05) * 0.4, 1.2, 0);

    renderer.render(scene, cam);
  }

  animate();
  return () => cancelAnimationFrame(rafId);
}
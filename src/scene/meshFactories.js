import * as THREE from "three";

// ── Plain (unverified) box ──────────────────────────────────────────────────
export function makePlainBox(sz, col, M, sh) {
  const g = new THREE.Group();

  const bm = [
    M(col, 0.7, 0.05), M(col, 0.7, 0.05),
    M(col + 0x0a0800, 0.55, 0.05), M(col, 0.7, 0.05),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.65, metalness: 0.05 }),
    M(col - 0x050400, 0.75, 0.05),
  ];
  g.add(sh(new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), bm)));

  [0, 1].forEach(h => {
    const t = sh(new THREE.Mesh(
      new THREE.BoxGeometry(h ? sz : 0.06, 0.022, h ? 0.06 : sz),
      M(0x6b4c1a, 0.6, 0)
    ));
    t.position.y = sz / 2 + 0.014;
    g.add(t);
  });

  const lc = document.createElement("canvas"); lc.width = 512; lc.height = 512;
  const lx = lc.getContext("2d");
  lx.fillStyle = "#2a1400"; lx.fillRect(0, 0, 512, 512);
  lx.strokeStyle = "#ffaa00"; lx.lineWidth = 14; lx.strokeRect(8, 8, 496, 496);
  lx.strokeStyle = "rgba(255,170,0,0.3)"; lx.lineWidth = 6; lx.strokeRect(18, 18, 476, 476);
  lx.fillStyle = "#ffaa00";
  lx.shadowColor = "#ffaa00"; lx.shadowBlur = 30;
  lx.font = "bold 200px monospace"; lx.textAlign = "center"; lx.fillText("?", 256, 330);
  lx.shadowBlur = 0;
  lx.fillStyle = "rgba(255,170,0,0.9)"; lx.font = "bold 42px monospace"; lx.fillText("UNVERIFIED", 256, 420);
  lx.fillStyle = "rgba(255,170,0,0.5)"; lx.font = "24px monospace"; lx.fillText("NO BLOCKCHAIN RECORD", 256, 468);

  const fl = new THREE.Mesh(
    new THREE.PlaneGeometry(sz * 0.82, sz * 0.82),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc) })
  );
  fl.position.set(0, sz * 0.02, sz / 2 + 0.015);
  g.add(fl);
  return g;
}

// ── Verified (QR-stamped) box ───────────────────────────────────────────────
export function makeVerifiedBox(sz, col, M, sh, QRS) {
  const g = new THREE.Group();

  const bm = [
    M(col, 0.25, 0.4), M(col, 0.25, 0.4),
    M(col + 0x050800, 0.18, 0.5), M(col, 0.25, 0.4),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.22, metalness: 0.45 }),
    M(col - 0x020500, 0.32, 0.3),
  ];
  g.add(sh(new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), bm)));

  // ── Tape strips on top ───────────────────────────────────────────────────
  [0, 1].forEach(h => {
    const t = sh(new THREE.Mesh(
      new THREE.BoxGeometry(h ? sz : 0.1, 0.028, h ? 0.1 : sz),
      new THREE.MeshStandardMaterial({
        color: 0x00c864, roughness: 0.1, metalness: 0.5,
        emissive: 0x00c864, emissiveIntensity: 1.2
      })
    ));
    t.position.y = sz / 2 + 0.018;
    g.add(t);
  });

  // ── QR face layers (base → white mat → QR code) ──────────────────────────
  const faceZ   = sz / 2;
  const qSz     = sz * 0.80;   // QR code display size
  const padding = sz * 0.06;   // white border padding around QR

  // Layer 0 — dark recess panel (sits flush with box face)
  const recess = new THREE.Mesh(
    new THREE.PlaneGeometry(sz * 0.96, sz * 0.96),
    new THREE.MeshBasicMaterial({ color: 0x001208 })
  );
  recess.position.set(0, sz * 0.02, faceZ + 0.001);
  g.add(recess);

  // Layer 1 — bright white backing so QR modules have full contrast
  const whiteBacking = new THREE.Mesh(
    new THREE.PlaneGeometry(qSz + padding * 2, qSz + padding * 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  whiteBacking.position.set(0, sz * 0.04, faceZ + 0.006);
  g.add(whiteBacking);

  // Layer 2 — QR texture (rendered at full opacity over white)
  const qrTex = QRS[Math.floor(Math.random() * QRS.length)];
  qrTex.minFilter = THREE.LinearFilter;   // crisp at close range
  qrTex.magFilter = THREE.LinearFilter;
  qrTex.anisotropy = 16;                  // sharp at angles

  const qrPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(qSz, qSz),
    new THREE.MeshBasicMaterial({
      map: qrTex,
      transparent: false,   // solid — no alpha blending darkening it
    })
  );
  qrPlane.position.set(0, sz * 0.04, faceZ + 0.012);
  g.add(qrPlane);

  // ── Slim glowing border (outside the white card, doesn't overlap QR) ─────
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x00c864, emissive: 0x00c864, emissiveIntensity: 1.6, roughness: 0.04,
  });
  const cardW = qSz + padding * 2;
  const borderThk = 0.035;
  const bZ = faceZ + 0.018;
  [
    [cardW + borderThk * 2, borderThk,  0,              cardW / 2 + borderThk / 2],  // top
    [cardW + borderThk * 2, borderThk,  0,             -cardW / 2 - borderThk / 2],  // bottom
    [borderThk,             cardW,     -cardW / 2 - borderThk / 2, 0],               // left
    [borderThk,             cardW,      cardW / 2 + borderThk / 2, 0],               // right
  ].forEach(([w, h, bx, by]) => {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(w, h), borderMat);
    bar.position.set(bx, by + sz * 0.04, bZ);
    g.add(bar);
  });

  // ── "CHAIN VERIFIED" badge — positioned below the QR card ────────────────
  const vc = document.createElement("canvas"); vc.width = 640; vc.height = 112;
  const vx = vc.getContext("2d");

  // Badge background
  vx.fillStyle = "#001208";
  vx.fillRect(0, 0, 640, 112);

  // Green border
  vx.strokeStyle = "#00c864";
  vx.lineWidth = 4;
  vx.strokeRect(4, 4, 632, 104);

  // Inner subtle glow line
  vx.strokeStyle = "rgba(0,200,100,0.25)";
  vx.lineWidth = 2;
  vx.strokeRect(10, 10, 620, 92);

  // Checkmark + text
  vx.fillStyle = "#00c864";
  vx.shadowColor = "#00c864";
  vx.shadowBlur = 22;
  vx.font = "bold 54px 'Courier New', monospace";
  vx.textAlign = "center";
  vx.fillText("✓ CHAIN VERIFIED", 320, 76);

  const badgePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(sz * 0.88, sz * 0.20),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(vc),
      transparent: true,
      depthWrite: false,
    })
  );
  // Sits just below the QR card
  badgePlane.position.set(0, -(qSz / 2 + padding + sz * 0.12) + sz * 0.04, faceZ + 0.018);
  g.add(badgePlane);

  return g;
}

// ── Forklift ────────────────────────────────────────────────────────────────
export function makeForklift(M, sh) {
  const g = new THREE.Group();

  g.add(sh(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.9), M(0x0e2018, 0.4, 0.5))));

  const cab = sh(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.85), M(0x0a1810, 0.35, 0.6)));
  cab.position.set(0.4, 0.9, 0);
  g.add(cab);

  const mast = sh(new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.4, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x00c864, roughness: 0.2, metalness: 0.6, emissive: 0x00c864, emissiveIntensity: 0.4 })
  ));
  mast.position.set(-0.7, 1.2, 0);
  g.add(mast);

  [-0.22, 0.22].forEach(oz => {
    const fk = sh(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.1), M(0x00a050, 0.25, 0.8)));
    fk.position.set(-1.1, 0.1, oz);
    g.add(fk);
  });

  [[-0.7, -0.55, -0.45], [0.6, -0.55, -0.45], [-0.7, -0.55, 0.45], [0.6, -0.55, 0.45]].forEach(([x, y, z]) => {
    const w = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 12), M(0x0a1208, 0.8, 0.2)));
    w.rotation.x = Math.PI / 2;
    w.position.set(x, y, z);
    g.add(w);
  });

  return g;
}

// ── Pallet ──────────────────────────────────────────────────────────────────
export function makePallet(M, sh) {
  const g = new THREE.Group();
  const pc = M(0x2a1a08, 0.8, 0.1);
  g.add(sh(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.1), pc)));
  for (let i = -1; i <= 1; i++) {
    const b = sh(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.18), pc));
    b.position.set(0, -0.11, i * 0.38);
    g.add(b);
  }
  return g;
}
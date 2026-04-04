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
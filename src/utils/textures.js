import * as THREE from "three";

/**
 * Generates a procedural QR-code-like texture on a canvas.
 * @param {number} seed - Offsets the pseudo-random data pattern.
 * @returns {THREE.CanvasTexture}
 */
export function makeQR(seed = 0) {
  const s = 200;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const x = cv.getContext("2d");

  x.fillStyle = "#0a1a0f";
  x.fillRect(0, 0, s, s);

  x.strokeStyle = "#00ff88";
  x.lineWidth = 2;
  x.strokeRect(3, 3, s - 6, s - 6);

  const fp = (ox, oy) => {
    x.fillStyle = "#00ff88"; x.fillRect(ox, oy, 44, 44);
    x.fillStyle = "#0a1a0f"; x.fillRect(ox + 5, oy + 5, 34, 34);
    x.fillStyle = "#00ff88"; x.fillRect(ox + 10, oy + 10, 24, 24);
    x.fillStyle = "#0a1a0f"; x.fillRect(ox + 16, oy + 16, 12, 12);
    x.fillStyle = "#00ff88"; x.fillRect(ox + 18, oy + 18, 8, 8);
  };
  fp(10, 10); fp(146, 10); fp(10, 146);

  const d = [1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1];
  x.fillStyle = "#00ff88";
  let di = seed;
  for (let r = 0; r < 8; r++) {
    for (let cc = 0; cc < 8; cc++) {
      const inF = (r < 4 && cc < 4) || (r < 4 && cc > 5) || (r > 5 && cc < 4);
      if (!inF && d[(di++) % d.length]) x.fillRect(70 + cc * 9, 70 + r * 9, 7, 7);
      if (!inF && d[(di + 3) % d.length]) x.fillRect(68 + cc * 10, 68 + r * 10, 5, 5);
    }
  }

  x.fillStyle = "rgba(0,255,136,0.55)";
  x.font = "bold 10px monospace";
  x.textAlign = "left";
  x.fillText("SHA:" + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase(), 12, 185);
  x.fillText("BLK#" + Math.floor(Math.random() * 99999), 12, 196);

  return new THREE.CanvasTexture(cv);
}

/**
 * Creates the "TRUSTCHAIN VERIFICATION HUB" sign mesh.
 * @param {number} BS - Building scale unit.
 * @returns {THREE.Mesh}
 */
export function makeWarehouseSign(BS) {
  const lc = document.createElement("canvas");
  lc.width = 1024; lc.height = 160;
  const lx = lc.getContext("2d");

  lx.fillStyle = "#000d07";
  lx.fillRect(0, 0, 1024, 160);
  for (let y = 0; y < 160; y += 4) {
    lx.fillStyle = "rgba(0,255,136,0.025)";
    lx.fillRect(0, y, 1024, 2);
  }

  lx.strokeStyle = "#00ff88";
  lx.lineWidth = 2;
  lx.shadowColor = "#00ff88";
  lx.shadowBlur = 14;
  lx.strokeRect(4, 4, 1016, 152);

  const c = (x, y, dx, dy) => {
    lx.beginPath(); lx.moveTo(x + dx * 24, y); lx.lineTo(x, y); lx.lineTo(x, y + dy * 24); lx.stroke();
  };
  c(4, 4, 1, 1); c(1020, 4, -1, 1); c(4, 156, 1, -1); c(1020, 156, -1, -1);

  lx.shadowBlur = 22;
  lx.fillStyle = "#00ff88";
  lx.font = "bold 50px 'Courier New',monospace";
  lx.textAlign = "center";
  lx.fillText("TRUSTCHAIN VERIFICATION HUB", 512, 72);

  lx.shadowBlur = 8;
  lx.fillStyle = "rgba(0,255,136,0.5)";
  lx.font = "13px 'Courier New',monospace";
  lx.fillText("[ BLOCKCHAIN AUTHENTICATED · SMART CONTRACT ENFORCED · QR VERIFIED ]", 512, 106);

  ["● LIVE", "◈ IMMUTABLE", "⬡ DISTRIBUTED"].forEach((t, i) => {
    lx.fillStyle = "rgba(0,255,136,0.65)";
    lx.font = "bold 12px monospace";
    lx.textAlign = "left";
    lx.fillText(t, 185 + i * 235, 136);
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.3 * BS, 0.7 * BS),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true, depthWrite: false })
  );
  plane.position.set(0, 1.82 * BS, 1.85 * BS);
  return plane;
}
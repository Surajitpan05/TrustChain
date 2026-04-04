import * as THREE from "three";

/**
 * Adds all lights to the scene and returns mutable refs needed by the
 * animation loop (glow, backFill, signLight).
 *
 * @param {THREE.Scene} scene
 * @returns {{ glow: THREE.PointLight, backFill: THREE.PointLight, signLight: THREE.PointLight }}
 */
export function buildLights(scene) {
  scene.add(new THREE.AmbientLight(0x0a2e1e, 0.85));

  const sun = new THREE.DirectionalLight(0x44ffaa, 1.4);
  sun.position.set(6, 24, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left   = -55;
  sun.shadow.camera.right  =  55;
  sun.shadow.camera.top    =  40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.camera.far    = 130;
  scene.add(sun);

  const rLight = new THREE.DirectionalLight(0xffaa44, 1.1);
  rLight.position.set(40, 10, 4);
  scene.add(rLight);

  const lLight = new THREE.DirectionalLight(0x00ff88, 1.3);
  lLight.position.set(-40, 8, 4);
  scene.add(lLight);

  const glow = new THREE.PointLight(0x00ff88, 3.2, 24);
  glow.position.set(0, 5, 2);
  scene.add(glow);

  const backFill = new THREE.PointLight(0xffcc66, 1.1, 24);
  backFill.position.set(26, 6, 0);
  scene.add(backFill);

  const signLight = new THREE.PointLight(0x00ff88, 4.5, 16);
  signLight.position.set(0, 9, 7);
  scene.add(signLight);

  return { glow, backFill, signLight };
}
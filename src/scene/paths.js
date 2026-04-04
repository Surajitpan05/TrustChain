import { BS } from "../constants/index.js";

export const ENTRY_X = 3.1 * BS;
export const EXIT_X  = -3.1 * BS;
export const FLOOR_Y = -1.6;

/**
 * Incoming — elevated staging rack top-right, arcs down to belt, feeds entry door.
 * @param {number} lane 0‥2
 */
export function incomingPath(lane) {
  const zOff = (lane - 1) * 1.1;
  return [
    { x: 28,            y: 8,             z: -4 + zOff },
    { x: 20,            y: 4,             z: -1 + zOff },
    { x: ENTRY_X + 3,   y: FLOOR_Y + 1.2, z:  0 + zOff * 0.4 },
    { x: ENTRY_X + 0.1, y: FLOOR_Y + 0.9, z:  0 },
  ];
}

/**
 * Exit — left door, outbound belt arc toward viewer-right, off screen.
 * @param {number} lane 0‥2
 */
export function exitPath(lane) {
  const zOff = (lane - 1) * 1.1;
  return [
    { x: EXIT_X - 0.1, y: FLOOR_Y + 0.9,  z:  0 },
    { x: EXIT_X - 4,   y: FLOOR_Y + 1.4,  z:  4 + zOff * 0.5 },
    { x: -14,          y: FLOOR_Y + 0.6,  z:  8 + zOff },
    { x: -22,          y: FLOOR_Y + 0.2,  z: 12 + zOff },
  ];
}
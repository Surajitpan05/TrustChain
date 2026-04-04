/**
 * Cubic Bezier interpolation between four control points.
 * @param {number} t  - Parameter [0, 1]
 * @param {{x,y,z}} p0
 * @param {{x,y,z}} p1
 * @param {{x,y,z}} p2
 * @param {{x,y,z}} p3
 * @returns {{x,y,z}}
 */
export function bez3(t, p0, p1, p2, p3) {
  const m = 1 - t, m2 = m * m, m3 = m2 * m, t2 = t * t, t3 = t2 * t;
  return {
    x: m3*p0.x + 3*m2*t*p1.x + 3*m*t2*p2.x + t3*p3.x,
    y: m3*p0.y + 3*m2*t*p1.y + 3*m*t2*p2.y + t3*p3.y,
    z: m3*p0.z + 3*m2*t*p1.z + 3*m*t2*p2.z + t3*p3.z,
  };
}
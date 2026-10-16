/** Shared math for the canvas-rendered 3D scenes (manual perspective, no WebGL). */

export const TAU = Math.PI * 2;
export const FOCAL = 3.2;

export type Vec3 = { x: number; y: number; z: number };
export type Pt = { x: number; y: number; z: number; s: number };

/** Yaw around Y, then camera tilt around X. Positive z faces the viewer. */
export function rotate(p: Vec3, rotY: number, tilt: number): Vec3 {
  const cr = Math.cos(rotY);
  const sr = Math.sin(rotY);
  const x = p.x * cr + p.z * sr;
  const z = -p.x * sr + p.z * cr;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x, y: p.y * ct - z * st, z: p.y * st + z * ct };
}

export function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

/** Camera yaw that brings a world point to the front of the scene. */
export function yawToFront(p: Vec3) {
  return Math.atan2(-p.x, p.z);
}

export function quad(p0: Pt, c: Pt, p1: Pt, u: number) {
  const v = 1 - u;
  return { x: v * v * p0.x + 2 * v * u * c.x + u * u * p1.x, y: v * v * p0.y + 2 * v * u * c.y + u * u * p1.y };
}

export function shortestAngle(from: number, to: number) {
  return ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

export function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function makeStars(count: number) {
  return Array.from({ length: count }, () => {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * TAU;
    const r = 1.25 + Math.random() * 0.45;
    const s = Math.sqrt(1 - u * u);
    return { x: Math.cos(phi) * s * r, y: u * r * 0.7, z: Math.sin(phi) * s * r, tw: Math.random() * TAU };
  });
}

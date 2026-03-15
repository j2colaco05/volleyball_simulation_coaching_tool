import { Player } from '../types';

// simple Catmull-Rom spline sampler
export function sampleCurve(pts: { x: number; y: number }[], samples = 20) {
  if (pts.length < 2) return [...pts];
  const out: { x: number; y: number }[] = [];
  const getP = (i: number) => {
    if (i < 0) return pts[0];
    if (i >= pts.length) return pts[pts.length - 1];
    return pts[i];
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = getP(i - 1);
    const p1 = getP(i);
    const p2 = getP(i + 1);
    const p3 = getP(i + 2);
    for (let t = 0; t <= 1; t += 1 / samples) {
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      out.push({ x, y });
    }
  }
  return out;
}

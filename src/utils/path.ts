// Simple path utilities for smoothing/simplification

// Convert flat number[] points to array of {x,y}
const toPairs = (pts: number[]) => {
  const arr: { x: number; y: number }[] = [];
  for (let i = 0; i < pts.length; i += 2) arr.push({ x: pts[i], y: pts[i + 1] });
  return arr;
};

const toFlat = (pairs: { x: number; y: number }[]) => {
  const out: number[] = [];
  for (const p of pairs) {
    out.push(p.x, p.y);
  }
  return out;
};

// Perpendicular distance from point p to line ab
const perpDist = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
};

// Ramer–Douglas–Peucker simplification
export const simplifyRDP = (points: number[], tolerance = 2): number[] => {
  const pts = toPairs(points);
  if (pts.length <= 2) return points.slice();

  const keep = new Array(pts.length).fill(false);
  keep[0] = true;
  keep[pts.length - 1] = true;

  const stack: Array<{ first: number; last: number }> = [{ first: 0, last: pts.length - 1 }];
  while (stack.length) {
    const { first, last } = stack.pop()!;
    let index = -1;
    let maxDist = 0;
    for (let i = first + 1; i < last; i++) {
      const d = perpDist(pts[i], pts[first], pts[last]);
      if (d > maxDist) {
        index = i;
        maxDist = d;
      }
    }
    if (index !== -1 && maxDist > tolerance) {
      keep[index] = true;
      stack.push({ first, last: index }, { first: index, last });
    }
  }
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) result.push(pts[i]);
  return toFlat(result);
};

// Moving average smoothing with window size w (odd preferred)
export const smoothMovingAverage = (points: number[], window = 3): number[] => {
  const pts = toPairs(points);
  if (pts.length <= 2 || window <= 1) return points.slice();
  const half = Math.max(1, Math.floor(window / 2));
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    let sx = 0, sy = 0, c = 0;
    for (let j = i - half; j <= i + half; j++) {
      const idx = Math.max(0, Math.min(pts.length - 1, j));
      sx += pts[idx].x;
      sy += pts[idx].y;
      c++;
    }
    out.push({ x: sx / c, y: sy / c });
  }
  return toFlat(out);
};

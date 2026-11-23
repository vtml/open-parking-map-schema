export interface ControlPoint {
  image: [number, number];
  map: [number, number];
}

export interface Affine {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  apply(point: [number, number]): [number, number];
}

function affine(a: number, b: number, c: number, d: number, e: number, f: number): Affine {
  return {
    a, b, c, d, e, f,
    apply(point) {
      return [a * point[0] + b * point[1] + e, c * point[0] + d * point[1] + f];
    },
  };
}

function solve3(rows: number[][], values: number[]): number[] {
  const m = rows.map((row, index) => [...row, values[index]]);
  for (let col = 0; col < 3; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < 3; row += 1) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }
    if (Math.abs(m[pivot][col]) < 1e-12) throw new Error("Control points are collinear, so an affine transform is not defined.");
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const scale = m[col][col];
    for (let k = col; k < 4; k += 1) m[col][k] /= scale;
    for (let row = 0; row < 3; row += 1) {
      if (row === col) continue;
      const factor = m[row][col];
      for (let k = col; k < 4; k += 1) m[row][k] -= factor * m[col][k];
    }
  }
  return [m[0][3], m[1][3], m[2][3]];
}

function similarity(first: ControlPoint, second: ControlPoint): Affine {
  const dx = second.image[0] - first.image[0];
  const dy = second.image[1] - first.image[1];
  const wx = second.map[0] - first.map[0];
  const wy = second.map[1] - first.map[1];
  const length = Math.hypot(dx, dy);
  if (length < 1e-12) throw new Error("The two image control points are the same.");
  const scale = Math.hypot(wx, wy) / length;
  const angle = Math.atan2(wy, wx) - Math.atan2(dy, dx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const a = scale * cos;
  const b = -scale * sin;
  const c = scale * sin;
  const d = scale * cos;
  const e = first.map[0] - (a * first.image[0] + b * first.image[1]);
  const f = first.map[1] - (c * first.image[0] + d * first.image[1]);
  return affine(a, b, c, d, e, f);
}

function affineFromThree(points: [ControlPoint, ControlPoint, ControlPoint]): Affine {
  const [p0, p1, p2] = points;
  const rows = points.map((point) => [point.image[0], point.image[1], 1]);
  const [a, b, e] = solve3(rows, [p0.map[0], p1.map[0], p2.map[0]]);
  const [c, d, f] = solve3(rows, [p0.map[1], p1.map[1], p2.map[1]]);
  return affine(a, b, c, d, e, f);
}

export function alignOverlay(points: ControlPoint[]): Affine {
  if (points.length < 2 || points.length > 3) {
    throw new Error("Align an overlay with two or three control points.");
  }
  if (points.length === 2) return similarity(points[0], points[1]);
  return affineFromThree([points[0], points[1], points[2]]);
}

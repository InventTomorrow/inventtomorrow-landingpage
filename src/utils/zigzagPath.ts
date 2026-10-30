export interface Point {
  x: number;
  y: number;
}

const CURVE_SAMPLES = 24;
const MIN_TOTAL_LENGTH = 1e-6;
const round = (value: number) => Math.round(value * 10) / 10;

function getControlPoints(from: Point, to: Point, tension: number) {
  const offset = (to.y - from.y) * tension;
  return [
    { x: from.x, y: from.y + offset },
    { x: to.x, y: to.y - offset },
  ] as const;
}

// Joins the points top to bottom with S-curves. Each curve leaves and arrives straight up and down, so the bends are rounded.
export function buildZigzagPath(points: Point[], tension = 0.5): string {
  if (points.length === 0) return '';
  let path = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const [controlA, controlB] = getControlPoints(from, to, tension);
    path += ` C ${round(controlA.x)} ${round(controlA.y)} ${round(controlB.x)} ${round(controlB.y)} ${round(to.x)} ${round(to.y)}`;
  }
  return path;
}

function getCurveLength(from: Point, to: Point, tension: number): number {
  const [controlA, controlB] = getControlPoints(from, to, tension);
  let length = 0;
  let previous = from;
  for (let step = 1; step <= CURVE_SAMPLES; step += 1) {
    const t = step / CURVE_SAMPLES;
    const u = 1 - t;
    const point = {
      x: u ** 3 * from.x + 3 * u * u * t * controlA.x + 3 * u * t * t * controlB.x + t ** 3 * to.x,
      y: u ** 3 * from.y + 3 * u * u * t * controlA.y + 3 * u * t * t * controlB.y + t ** 3 * to.y,
    };
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}

// How far along the whole path (0 to 1) each point sits, by length, so a drawn line can be matched to the points it has passed.
export function getPathFractions(points: Point[], tension = 0.5): number[] {
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    distances.push(distances[index - 1] + getCurveLength(points[index - 1], points[index], tension));
  }
  const total = distances[distances.length - 1];
  return distances.map((distance) => (total < MIN_TOTAL_LENGTH ? 0 : distance / total));
}

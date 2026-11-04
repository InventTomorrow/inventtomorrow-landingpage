type Point = [number, number];

function pointToward(from: Point, to: Point, distance: number): Point {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  return [from[0] + (dx / length) * distance, from[1] + (dy / length) * distance];
}

const format = ([x, y]: Point) => `${x.toFixed(2)} ${y.toFixed(2)}`;

// An SVG path for a pointy-top hexagon with softly rounded corners. `inset` keeps a stroke inside the box.
export function getRoundedHexagonPath(width: number, height: number, radius: number, inset = 0): string {
  const corners: Point[] = [
    [width / 2, inset],
    [width - inset, height * 0.25],
    [width - inset, height * 0.75],
    [width / 2, height - inset],
    [inset, height * 0.75],
    [inset, height * 0.25],
  ];

  const segments = corners.map((corner, index) => {
    const previous = corners[(index + corners.length - 1) % corners.length];
    const next = corners[(index + 1) % corners.length];
    const entry = pointToward(corner, previous, radius);
    const exit = pointToward(corner, next, radius);
    return `${index === 0 ? 'M' : 'L'}${format(entry)} Q${format(corner)} ${format(exit)}`;
  });

  return `${segments.join(' ')} Z`;
}

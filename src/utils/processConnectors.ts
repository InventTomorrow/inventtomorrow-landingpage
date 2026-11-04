export interface Point {
  x: number;
  y: number;
}

export interface Connector {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Dotted segments between neighbouring step centres. `margin` (0 to 0.5) is the share of each gap left clear at both ends,
// so a segment never touches a hexagon or runs into the text beside it.
export function getConnectorSegments(centres: Point[], margin = 0.32): Connector[] {
  return centres.slice(0, -1).map((from, index) => {
    const to = centres[index + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return { x1: from.x + dx * margin, y1: from.y + dy * margin, x2: to.x - dx * margin, y2: to.y - dy * margin };
  });
}

export interface AccordionMetrics {
  viewportHeight: number;
  // Height of one closed row; the open row is this plus the panel
  rowHeight: number;
  panelHeight: number;
  // Space kept free at the top of the screen for the navbar
  topClearance: number;
  count: number;
}

// The stack is always `count` rows plus one open panel tall, so it never changes the page height.
// Scrolling one row's height moves the next row to exactly where the last one opened, so the open row stays put on screen.
export function getRestTop({ viewportHeight, rowHeight, panelHeight, topClearance }: AccordionMetrics): number {
  return Math.max(topClearance, (viewportHeight - rowHeight - panelHeight) / 2);
}

export function getActiveRowIndex(stackTop: number, metrics: AccordionMetrics): number {
  if (metrics.count <= 0 || metrics.rowHeight <= 0) return 0;
  const rowsPassed = Math.round((getRestTop(metrics) - stackTop) / metrics.rowHeight);
  return Math.min(metrics.count - 1, Math.max(0, rowsPassed));
}

export function getStackTopForRow(index: number, metrics: AccordionMetrics): number {
  return getRestTop(metrics) - index * metrics.rowHeight;
}

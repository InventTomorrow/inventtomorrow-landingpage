export interface FanOutStart {
  // Where the item begins, as a percentage of its own size
  fromX: number;
  fromY: number;
  delay: number;
  // Stacking order while it slides out: lower numbers sit behind
  layer: number;
}

const STACKED_OFFSET_PERCENT = -40;
const ALTERNATE_LEAN_PERCENT = 6;

// Items in a grid start piled on its first cell, then slide out to their own in reading order.
// A single column (phones) can't fan sideways, so each item slips out from behind the one above it.
export function getFanOutStart(index: number, count: number, columns: number, step = 0.16): FanOutStart {
  const layer = count - index;
  if (columns <= 1) return { fromX: 0, fromY: STACKED_OFFSET_PERCENT, delay: 0, layer };
  const column = index % columns;
  const row = Math.floor(index / columns);
  return { fromX: 0 - column * 100, fromY: 0 - row * 100, delay: Number((index * step).toFixed(3)), layer };
}

// Rows in one column slip out from behind the row above, leaning left and right in turn.
export function getAlternatingStackStart(index: number, count: number): FanOutStart {
  const lean = index % 2 === 0 ? -ALTERNATE_LEAN_PERCENT : ALTERNATE_LEAN_PERCENT;
  return { fromX: lean, fromY: STACKED_OFFSET_PERCENT, delay: 0, layer: count - index };
}

/**
 * Stagger calculations for animated text sequences
 */

export function splitWords(text: string): string[] {
  if (!text) return [];
  return text.trim().split(/\s+/);
}

export function calculateWordDelay(
  index: number,
  baseDelay = 0.15,
  step = 0.08
): number {
  if (index < 0) return baseDelay;
  return Number((baseDelay + index * step).toFixed(3));
}

export type ScrollDirection = 'down' | 'up';

// Rows enter top-first while scrolling down and bottom-first while scrolling up.
export function getRowDelay(index: number, count: number, direction: ScrollDirection, step = 0.09): number {
  if (index < 0 || index >= count) return 0;
  const position = direction === 'down' ? index : count - 1 - index;
  return Number((position * step).toFixed(3));
}

export interface WordStaggerItem {
  word: string;
  delay: number;
}

export function generateWordStaggers(
  text: string,
  baseDelay = 0.15,
  step = 0.08
): WordStaggerItem[] {
  const words = splitWords(text);
  return words.map((word, index) => ({
    word,
    delay: calculateWordDelay(index, baseDelay, step),
  }));
}

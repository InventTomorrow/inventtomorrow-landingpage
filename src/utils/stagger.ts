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

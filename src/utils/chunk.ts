// Splits a list into consecutive groups of at most `size` items.
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) return [[...items]];
  const groups: T[][] = [];
  for (let start = 0; start < items.length; start += size) groups.push(items.slice(start, start + size));
  return groups;
}

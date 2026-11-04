import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRoundedHexagonPath } from './roundedHexagon';

const path = getRoundedHexagonPath(93, 100, 9, 1.5);

test('is one closed path with a rounded corner at each of the six points', () => {
  assert.ok(path.startsWith('M'));
  assert.ok(path.endsWith('Z'));
  assert.equal(path.match(/Q/g)?.length, 6);
});

test('stays inside the box', () => {
  const numbers = (path.match(/-?\d+\.\d+/g) ?? []).map(Number);
  assert.ok(numbers.every((value) => value >= 0 && value <= 100));
});

test('the top corner is rounded: the path starts below the very top point', () => {
  const [, startY] = path.slice(1).split(' ').map(Number);
  assert.ok(startY > 1.5);
});

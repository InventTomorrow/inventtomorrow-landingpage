import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chunk } from './chunk';

test('splits into groups of the given size, the last one shorter', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5, 6, 7], 3), [[1, 2, 3], [4, 5, 6], [7]]);
});

test('keeps a short list in one group', () => {
  assert.deepEqual(chunk([1, 2], 4), [[1, 2]]);
});

test('returns no groups for an empty list', () => {
  assert.deepEqual(chunk([], 3), []);
});

test('treats a size below 1 as one group', () => {
  assert.deepEqual(chunk([1, 2, 3], 0), [[1, 2, 3]]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { getAlternatingStackStart, getFanOutStart } from './fanOut';

test('getFanOutStart keeps the first item in place and on top', () => {
  assert.deepEqual(getFanOutStart(0, 3, 3), { fromX: 0, fromY: 0, delay: 0, layer: 3 });
});

test('getFanOutStart starts later items on the first column, one step later each', () => {
  assert.deepEqual(getFanOutStart(2, 3, 3), { fromX: -200, fromY: 0, delay: 0.32, layer: 1 });
});

test('getFanOutStart piles a two-column grid on its first cell', () => {
  assert.deepEqual(getFanOutStart(3, 4, 2), { fromX: -100, fromY: -100, delay: 0.48, layer: 1 });
  assert.deepEqual(getFanOutStart(2, 4, 2), { fromX: 0, fromY: -100, delay: 0.32, layer: 2 });
});

test('getFanOutStart slips out from behind the item above in a single column', () => {
  assert.deepEqual(getFanOutStart(2, 4, 1), { fromX: 0, fromY: -40, delay: 0, layer: 2 });
});

test('getAlternatingStackStart leans left then right and keeps earlier rows on top', () => {
  assert.deepEqual(getAlternatingStackStart(0, 6), { fromX: -6, fromY: -40, delay: 0, layer: 6 });
  assert.deepEqual(getAlternatingStackStart(1, 6), { fromX: 6, fromY: -40, delay: 0, layer: 5 });
  assert.deepEqual(getAlternatingStackStart(2, 6), { fromX: -6, fromY: -40, delay: 0, layer: 4 });
});

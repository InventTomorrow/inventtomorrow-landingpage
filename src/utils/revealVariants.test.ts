import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRevealHidden, getRevealVariants } from './revealVariants';

test('up starts below, down starts above', () => {
  assert.deepEqual(getRevealHidden('up', 24), { opacity: 0, y: 24 });
  assert.deepEqual(getRevealHidden('down', 24), { opacity: 0, y: -24 });
});

test('left starts to the left and right starts to the right', () => {
  assert.deepEqual(getRevealHidden('left', 40), { opacity: 0, x: -40 });
  assert.deepEqual(getRevealHidden('right', 40), { opacity: 0, x: 40 });
});

test('zoom and fade ignore the distance', () => {
  assert.deepEqual(getRevealHidden('zoom', 99), { opacity: 0, scale: 0.92 });
  assert.deepEqual(getRevealHidden('fade', 99), { opacity: 0 });
});

test('every variant ends fully visible and in place, with the given timing', () => {
  const shown = getRevealVariants('left', 40, 0.5, 0.2).shown as Record<string, unknown>;
  assert.equal(shown.opacity, 1);
  assert.equal(shown.x, 0);
  assert.equal(shown.y, 0);
  assert.equal(shown.scale, 1);
  assert.deepEqual(shown.transition, { duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] });
});

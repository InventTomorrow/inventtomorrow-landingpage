import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getConnectorSegments } from './processConnectors';

const centres = [
  { x: 100, y: 300 },
  { x: 300, y: 100 },
  { x: 500, y: 300 },
];

test('there is one segment between each pair of neighbours', () => {
  assert.equal(getConnectorSegments(centres).length, 2);
  assert.equal(getConnectorSegments(centres.slice(0, 1)).length, 0);
});

test('segments stay clear of both centres', () => {
  const [segment] = getConnectorSegments(centres, 0.3);
  assert.deepEqual(segment, { x1: 160, y1: 240, x2: 240, y2: 160 });
});

test('segments zig-zag with the centres: the first rises and the second falls', () => {
  const [first, second] = getConnectorSegments(centres);
  assert.ok(first.y2 < first.y1);
  assert.ok(second.y2 > second.y1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildZigzagPath, getPathFractions } from './zigzagPath';

test('buildZigzagPath returns an empty path for no points', () => {
  assert.equal(buildZigzagPath([]), '');
});

test('buildZigzagPath starts at the first point and ends at the last', () => {
  assert.equal(buildZigzagPath([{ x: 10, y: 20 }]), 'M 10 20');
  assert.equal(
    buildZigzagPath([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]),
    'M 0 0 C 0 50 100 50 100 100',
  );
});

test('buildZigzagPath bends back and forth between left and right points', () => {
  const path = buildZigzagPath([
    { x: 20, y: 0 },
    { x: 80, y: 100 },
    { x: 20, y: 200 },
  ]);
  assert.equal(path, 'M 20 0 C 20 50 80 50 80 100 C 80 150 20 150 20 200');
});

test('getPathFractions spreads points along a straight line by distance', () => {
  const fractions = getPathFractions([
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: 0, y: 400 },
  ]);
  assert.deepEqual(
    fractions.map((value) => Math.round(value * 1000) / 1000),
    [0, 0.25, 1],
  );
});

test('getPathFractions puts the middle of a symmetric zigzag at one half', () => {
  const [, middle] = getPathFractions([
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 200 },
  ]);
  assert.ok(Math.abs(middle - 0.5) < 1e-9);
});

test('getPathFractions returns zeros when every point is the same', () => {
  assert.deepEqual(
    getPathFractions([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]),
    [0, 0],
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressAtStepCenter, getStepIndexFromProgress, getStepProgress } from './scrollSteps';

test('getStepIndexFromProgress moves one step at a time as progress grows', () => {
  assert.equal(getStepIndexFromProgress(0, 7), 0);
  assert.equal(getStepIndexFromProgress(0.14, 7), 0);
  assert.equal(getStepIndexFromProgress(0.15, 7), 1);
  assert.equal(getStepIndexFromProgress(0.5, 7), 3);
  assert.equal(getStepIndexFromProgress(0.99, 7), 6);
});

test('getStepIndexFromProgress stays on the first and last step outside the range', () => {
  assert.equal(getStepIndexFromProgress(-0.4, 7), 0);
  assert.equal(getStepIndexFromProgress(1, 7), 6);
  assert.equal(getStepIndexFromProgress(3, 7), 6);
});

test('getStepIndexFromProgress returns 0 when there is one step or none', () => {
  assert.equal(getStepIndexFromProgress(0.8, 1), 0);
  assert.equal(getStepIndexFromProgress(0.8, 0), 0);
});

test('getStepProgress fills 0 to 1 within each step', () => {
  assert.equal(getStepProgress(0, 4), 0);
  assert.equal(getStepProgress(0.125, 4), 0.5);
  assert.equal(getStepProgress(0.25, 4), 0);
  assert.equal(getStepProgress(1, 4), 1);
  assert.equal(getStepProgress(2, 4), 1);
  assert.equal(getStepProgress(-1, 4), 0);
});

test('getProgressAtStepCenter lands inside the matching step', () => {
  for (let index = 0; index < 7; index += 1) {
    assert.equal(getStepIndexFromProgress(getProgressAtStepCenter(index, 7), 7), index);
  }
});

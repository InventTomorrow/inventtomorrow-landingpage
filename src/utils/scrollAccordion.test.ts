import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveRowIndex, getRestTop, getStackTopForRow, type AccordionMetrics } from './scrollAccordion';

const metrics: AccordionMetrics = { viewportHeight: 900, rowHeight: 100, panelHeight: 500, topClearance: 96, count: 7 };

test('getRestTop centres the open row on a tall screen', () => {
  assert.equal(getRestTop(metrics), 150);
});

test('getRestTop keeps the open row below the navbar on a short screen', () => {
  assert.equal(getRestTop({ ...metrics, viewportHeight: 640 }), 96);
});

test('getActiveRowIndex opens the first row until the stack reaches its resting place', () => {
  assert.equal(getActiveRowIndex(600, metrics), 0);
  assert.equal(getActiveRowIndex(150, metrics), 0);
});

test('getActiveRowIndex opens the next row after each row height of scrolling', () => {
  assert.equal(getActiveRowIndex(50, metrics), 1);
  assert.equal(getActiveRowIndex(-50, metrics), 2);
  assert.equal(getActiveRowIndex(-450, metrics), 6);
});

test('getActiveRowIndex switches halfway between two rows and stays on the last row after the end', () => {
  assert.equal(getActiveRowIndex(101, metrics), 0);
  assert.equal(getActiveRowIndex(99, metrics), 1);
  assert.equal(getActiveRowIndex(-2000, metrics), 6);
});

test('getActiveRowIndex handles an empty stack', () => {
  assert.equal(getActiveRowIndex(0, { ...metrics, count: 0 }), 0);
});

test('getStackTopForRow is where getActiveRowIndex opens that row', () => {
  for (let index = 0; index < metrics.count; index += 1) {
    assert.equal(getActiveRowIndex(getStackTopForRow(index, metrics), metrics), index);
  }
});

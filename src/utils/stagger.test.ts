import test from 'node:test';
import assert from 'node:assert/strict';
import { splitWords, calculateWordDelay, generateWordStaggers, getRowDelay } from './stagger';

test('splitWords properly tokenizes text', () => {
  const words = splitWords('WE BUILD END-TO-END AI AUTOMATION SYSTEMS.');
  assert.deepEqual(words, [
    'WE',
    'BUILD',
    'END-TO-END',
    'AI',
    'AUTOMATION',
    'SYSTEMS.',
  ]);
});

test('calculateWordDelay implements 0.15s base and 0.08s step', () => {
  assert.equal(calculateWordDelay(0), 0.15);
  assert.equal(calculateWordDelay(1), 0.23);
  assert.equal(calculateWordDelay(2), 0.31);
  assert.equal(calculateWordDelay(3), 0.39);
  assert.equal(calculateWordDelay(4), 0.47);
  assert.equal(calculateWordDelay(5), 0.55);
});

test('generateWordStaggers builds correct delay sequence for heading', () => {
  const sequence = generateWordStaggers('WE BUILD END-TO-END AI AUTOMATION SYSTEMS.');
  assert.equal(sequence.length, 6);
  assert.equal(sequence[0].word, 'WE');
  assert.equal(sequence[0].delay, 0.15);
  assert.equal(sequence[1].word, 'BUILD');
  assert.equal(sequence[1].delay, 0.23);
  assert.equal(sequence[5].word, 'SYSTEMS.');
  assert.equal(sequence[5].delay, 0.55);
});

test('getRowDelay starts at the top row when scrolling down', () => {
  assert.equal(getRowDelay(0, 5, 'down'), 0);
  assert.equal(getRowDelay(1, 5, 'down'), 0.09);
  assert.equal(getRowDelay(4, 5, 'down'), 0.36);
});

test('getRowDelay starts at the bottom row when scrolling up', () => {
  assert.equal(getRowDelay(4, 5, 'up'), 0);
  assert.equal(getRowDelay(3, 5, 'up'), 0.09);
  assert.equal(getRowDelay(0, 5, 'up'), 0.36);
});

test('getRowDelay uses a custom step and ignores out-of-range rows', () => {
  assert.equal(getRowDelay(2, 5, 'down', 0.2), 0.4);
  assert.equal(getRowDelay(-1, 5, 'down'), 0);
  assert.equal(getRowDelay(5, 5, 'up'), 0);
});

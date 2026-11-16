import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_EXPECTED_MS, FAST_STAGE_MS, MIN_READING_MS, NO_EXTRA_WAIT_MS, nextExpectedMs, revealPlan, stageLabel, stageThresholds, THINKING_STEPS, thinkingStage } from './thinking';

test('Invo moves from reading to understanding to thinking, and never goes backwards while waiting', () => {
  assert.deepEqual(thinkingStage(0, false), { step: 0, label: 'Reading your message' });
  assert.deepEqual(thinkingStage(800, false), { step: 1, label: 'Understanding what you need' });
  assert.deepEqual(thinkingStage(2500, false), { step: 2, label: 'Thinking it through' });
  assert.equal(thinkingStage(7000, false).label, 'Checking the details');
  assert.equal(thinkingStage(30_000, false).label, 'Almost there');
  for (const expected of [400, DEFAULT_EXPECTED_MS, 12_000]) {
    let previous = 0;
    for (let ms = 0; ms <= 20_000; ms += 100) {
      const { step } = thinkingStage(ms, false, expected);
      assert.ok(step >= previous && step < THINKING_STEPS.length - 1, `${expected}: ${ms}ms`);
      previous = step;
    }
  }
});

test('stage timing follows how fast replies usually are, within sane limits', () => {
  const [fastReading, fastUnderstanding] = stageThresholds(400);
  const [slowReading, slowUnderstanding] = stageThresholds(12_000);
  assert.equal(fastReading, MIN_READING_MS);
  assert.ok(fastUnderstanding < slowUnderstanding && fastReading <= slowReading);
  assert.ok(slowReading <= 700 && slowUnderstanding <= 1800);
  // A recent run of fast replies pulls the expectation down, a slow one pushes it up.
  assert.ok(nextExpectedMs(2500, 600) < 2500);
  assert.ok(nextExpectedMs(2500, 9000) > 2500);
  assert.ok(nextExpectedMs(2500, 10 ** 9) <= 2500 * 0.6 + 15_000 * 0.4);
});

test('a reply that already took a while appears at once; only a near-instant one is held for a short beat', () => {
  for (const waited of [NO_EXTRA_WAIT_MS, 1500, 6000]) {
    assert.deepEqual(revealPlan(waited), { readingWaitMs: 0, steps: [], stageMs: 0, typingMs: 0 }, String(waited));
  }
  const instant = revealPlan(40);
  assert.equal(instant.readingWaitMs, MIN_READING_MS - 40);
  assert.deepEqual(instant.steps, [1, 2]);
  assert.equal(instant.stageMs, FAST_STAGE_MS);
  assert.deepEqual(revealPlan(600).steps, [2]);
  // The longest possible hold is short.
  const longest = instant.readingWaitMs + instant.steps.length * instant.stageMs + instant.typingMs;
  assert.ok(longest < 700, `${longest}ms`);
});

test('a ready reply always shows the final step', () => {
  for (const ms of [0, 500, 4000, 60_000]) assert.deepEqual(thinkingStage(ms, true), { step: 3, label: stageLabel(3) });
});

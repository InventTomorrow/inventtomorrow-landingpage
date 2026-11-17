import assert from 'node:assert/strict';
import test from 'node:test';
import { FOUNDING_CLOSES_AT, timeLeft } from './countdown';

test('countdown splits the remaining time into days, hours, minutes and seconds', () => {
  const now = FOUNDING_CLOSES_AT - ((2 * 86_400 + 3 * 3600 + 4 * 60 + 5) * 1000);
  assert.deepEqual(timeLeft(FOUNDING_CLOSES_AT, now), { days: 2, hours: 3, minutes: 4, seconds: 5 });
});

test('countdown ends (null) once the offer has closed', () => {
  assert.equal(timeLeft(FOUNDING_CLOSES_AT, FOUNDING_CLOSES_AT), null);
  assert.equal(timeLeft(FOUNDING_CLOSES_AT, FOUNDING_CLOSES_AT + 60_000), null);
});

test('the offer closes at the end of 1 December 2026, Eastern time', () => {
  assert.equal(new Date(FOUNDING_CLOSES_AT).toISOString(), '2026-12-02T04:59:59.000Z');
});

test('closesAt uses the real close time unless a test length is given', async () => {
  const { closesAt, FOUNDING_CLOSES_AT, timeLeft } = await import('./countdown.ts');
  assert.equal(closesAt(1000), FOUNDING_CLOSES_AT);
  assert.equal(closesAt(1000, Number.NaN), FOUNDING_CLOSES_AT);
  assert.equal(timeLeft(closesAt(1000, 13), 1000)?.days, 13);
});

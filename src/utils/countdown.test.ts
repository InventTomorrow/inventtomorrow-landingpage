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

test('the offer closes at the end of 15 January 2027, Eastern time', () => {
  assert.equal(new Date(FOUNDING_CLOSES_AT).toISOString(), '2027-01-16T04:59:59.000Z');
});

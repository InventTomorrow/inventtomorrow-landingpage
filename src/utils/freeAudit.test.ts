import assert from 'node:assert/strict';
import test from 'node:test';
import { auditResultMessage, auditStep, calculateAudit, CLEAN_PRICE_OPTIONS, MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS, parseAuditAnswers, type AuditAnswers } from './freeAudit';

const example: AuditAnswers = { businessName: 'Bright Home Cleaning', missedCalls: '6–15', oldQuotes: '50–200', typicalClean: '$120–$180' };

test('the supplied audit example produces 43 monthly calls, $1,300 missed calls and $1,700 old quotes', () => {
  assert.deepEqual(calculateAudit(example), {
    missedCallsMonth: 43, missedCallValue: 1300, oldQuotesNumber: 125, revivalValue: 1700, guaranteeStatus: 'close',
  });
});

test('every answer combination stays finite, rounds dollar estimates to $50, and uses the correct guarantee threshold', () => {
  for (const missedCalls of MISSED_CALL_OPTIONS) for (const oldQuotes of OLD_QUOTE_OPTIONS) for (const typicalClean of CLEAN_PRICE_OPTIONS) {
    const result = calculateAudit({ ...example, missedCalls, oldQuotes, typicalClean });
    assert.ok(Number.isFinite(result.missedCallsMonth));
    assert.equal(result.missedCallValue % 50, 0);
    if (result.revivalValue !== null) assert.equal(result.revivalValue % 50, 0);
    assert.equal(result.guaranteeStatus, ['200–500', 'More than 500'].includes(oldQuotes) ? 'qualifies' : oldQuotes === '50–200' ? 'close' : 'none');
  }
});

test('unknown old quotes omit the quote estimate and guarantee rather than inventing a count', () => {
  const result = calculateAudit({ ...example, missedCalls: 'Not sure', oldQuotes: 'Not sure' });
  assert.equal(result.oldQuotesNumber, null);
  assert.equal(result.revivalValue, null);
  const message = auditResultMessage(example.businessName, result);
  assert.match(message, /43 missed calls/);
  assert.doesNotMatch(message, /old quotes|Guarantee|null/);
  assert.match(message, /rough estimates/);
});

test('the audit advances only after each required answer and rejects incomplete or unrecognized server inputs', () => {
  assert.equal(auditStep({}), 0);
  assert.equal(auditStep({ businessName: 'Bright Home' }), 1);
  assert.equal(auditStep({ businessName: 'Bright Home', missedCalls: '0–5' }), 2);
  assert.equal(auditStep(example), 4);
  assert.deepEqual(parseAuditAnswers(example), example);
  for (const value of [null, [], {}, { ...example, missedCalls: '100' }, { ...example, oldQuotes: '5000' }, { ...example, typicalClean: 200 }, { ...example, businessName: ' ' }]) {
    assert.equal(parseAuditAnswers(value), null);
  }
});

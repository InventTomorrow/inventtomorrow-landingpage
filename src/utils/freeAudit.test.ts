import assert from 'node:assert/strict';
import test from 'node:test';
import { AUDIT_QUESTIONS, auditResultMessage, auditStep, calculateAudit, CLEAN_PRICE_OPTIONS, interpretAuditReply, MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS, parseAuditAnswers, type AuditAnswers } from './freeAudit';

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

test('audit questions stay short enough to read at a glance', () => {
  for (const question of AUDIT_QUESTIONS) assert.ok(question.split(' ').length <= 12, question);
});

test('a typed business name is recorded, while greetings, "yes" and contact details just repeat the question', () => {
  const name = (text: string) => interpretAuditReply(0, text);
  assert.deepEqual(name('Bright Home Cleaning'), { kind: 'answer', value: 'Bright Home Cleaning' });
  assert.deepEqual(name('My business is called Sparkle Clean.'), { kind: 'answer', value: 'Sparkle Clean' });
  assert.deepEqual(name("It's AL"), { kind: 'answer', value: 'AL' });
  assert.deepEqual(name('The Cleaning Company LLC'), { kind: 'answer', value: 'The Cleaning Company LLC' });
  for (const text of ['Book my free audit', 'yes', 'Hi', 'ok!', 'Continue my free audit', 'dana@example.com', '(202) 234-5678']) {
    assert.deepEqual(name(text), { kind: 'repeat' }, text);
  }
  for (const text of ['What does it cost?', 'how does this work', "I'm missing calls", 'We do mostly deep cleans and move-outs around Austin and nearby towns']) {
    assert.deepEqual(name(text), { kind: 'ask' }, text);
  }
});

test('typed numbers map to the same ranges as the buttons, without asking the AI', () => {
  const cases: [1 | 2 | 3, string, string][] = [
    [1, '6–15', '6–15'], [1, '6-15', '6–15'], [1, 'about 10', '6–15'], [1, 'ten', '6–15'], [1, '10-20', '6–15'], [1, '3', '0–5'],
    [1, 'none', '0–5'], [1, '20 calls', '16–30'], [1, 'over 30', 'More than 30'], [1, '30+', 'More than 30'],
    [1, '10 a day', 'More than 30'], [1, 'idk', 'Not sure'], [1, "I don't know", 'Not sure'],
    [2, '150', '50–200'], [2, '200', '200–500'], [2, 'under 50', 'Under 50'], [2, '1,000', 'More than 500'],
    [2, '1k', 'More than 500'], [2, '20 a month', '200–500'], [2, 'not sure', 'Not sure'],
    [3, '$150', '$120–$180'], [3, 'about 200 dollars', '$180–$250'], [3, '120-180', '$120–$180'], [3, '$90', 'Under $120'],
    [3, '300', 'Over $250'], [3, 'it costs about 150', '$120–$180'],
  ];
  for (const [step, text, value] of cases) assert.deepEqual(interpretAuditReply(step, text), { kind: 'answer', value }, `${step}: ${text}`);
  // Not an answer: ask again (no AI call, no invented range).
  for (const [step, text] of [[1, 'lots'], [2, 'yes'], [3, 'not sure'], [3, '$40 an hour'], [1, 'Book my free audit']] as const) {
    assert.deepEqual(interpretAuditReply(step, text), { kind: 'repeat' }, `${step}: ${text}`);
  }
  // A real question goes to the AI; the chat then repeats the waiting question.
  for (const [step, text] of [[1, 'What counts as a missed call?'], [3, 'how much do you charge?'], [2, 'My quotes go quiet']] as const) {
    assert.deepEqual(interpretAuditReply(step, text), { kind: 'ask' }, `${step}: ${text}`);
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAudit } from '../../server/audit';
import {
  BUSINESS_AUDIT_QUESTIONS, BUSINESS_AUDIT_STAGES, businessAuditResponses,
  businessAuditSubmissionText, isBusinessAuditStageComplete, parseBusinessAuditAnswers, NO_RELIABLE_ESTIMATE,
  type BusinessAuditAnswers,
} from './businessAudit';

const completeAnswers = (): BusinessAuditAnswers => Object.fromEntries(BUSINESS_AUDIT_QUESTIONS.map((question) =>
  [question.id, question.maxSelections ? question.options.slice(0, 2) : question.options[0]]));

test('the cleaning questionnaire preserves the supplied four steps, 16 IDs, order and individual answer options', () => {
  assert.deepEqual(BUSINESS_AUDIT_STAGES.map((stage) => stage.title), [
    'Your Business', 'Missed Calls & Response Time', 'Follow-Ups & Unused Leads', 'Business Value & Readiness',
  ]);
  assert.ok(BUSINESS_AUDIT_STAGES.every((stage) => stage.questions.length === 4));
  assert.deepEqual(BUSINESS_AUDIT_QUESTIONS.map((question) => question.id), [
    'A1', 'A2', 'A3', 'A12', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A13', 'E1', 'E2', 'E3', 'A17',
  ]);
  assert.deepEqual(BUSINESS_AUDIT_QUESTIONS.map((question) => question.options.length), [4, 4, 6, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 3, 5, 4]);
  assert.equal(BUSINESS_AUDIT_QUESTIONS.find((question) => question.id === 'A12')?.options[2], '$181 to $250');
  for (const question of BUSINESS_AUDIT_QUESTIONS) {
    for (const option of question.options) {
      assert.ok(parseBusinessAuditAnswers({ ...completeAnswers(), [question.id]: question.maxSelections ? [option] : option }));
    }
    const partial = completeAnswers();
    delete partial[question.id];
    assert.equal(parseBusinessAuditAnswers(partial), null, `${question.id} is required`);
    assert.equal(parseBusinessAuditAnswers({ ...completeAnswers(), [question.id]: 'Unknown option' }), null);
  }
});

test('lead sources require one or two distinct allowed selections and all steps must be complete', () => {
  for (const sources of [[], ['Referrals', 'Social media', 'Repeat clients'], ['Referrals', 'Referrals'], ['Unknown source'], 'Referrals', null]) {
    assert.equal(parseBusinessAuditAnswers({ ...completeAnswers(), A3: sources }), null);
  }
  assert.ok(parseBusinessAuditAnswers({ ...completeAnswers(), A3: ['Referrals'] }));
  assert.deepEqual(parseBusinessAuditAnswers({ ...completeAnswers(), A3: ['Referrals', 'Google or Google Maps'] })?.A3, ['Google or Google Maps', 'Referrals']);
  assert.equal(parseBusinessAuditAnswers(null), null);
  assert.equal(parseBusinessAuditAnswers([]), null);
  assert.equal(isBusinessAuditStageComplete({}, 0), false);
  assert.equal(isBusinessAuditStageComplete(completeAnswers(), 4), false);
  for (let index = 0; index < 4; index++) assert.equal(isBusinessAuditStageComplete(completeAnswers(), index), true);
  assert.throws(() => businessAuditResponses({}), /all 16/);
  assert.deepEqual(parseBusinessAuditAnswers({ ...completeAnswers(), unrelated: 'ignored' }), completeAnswers());
});

test('report input retains every question, ID and selected answer without creating a score or revenue estimate', () => {
  const answers = completeAnswers();
  const responses = businessAuditResponses(answers);
  const text = businessAuditSubmissionText('Bright Home Cleaning', answers);
  assert.equal(responses.length, 16);
  responses.forEach((response, index) => {
    assert.equal(response.number, index + 1);
    assert.deepEqual(response.answer, answers[response.id]);
    assert.ok(text.includes(`(${response.id}) ${response.question}`));
  });
  assert.match(text, /Google or Google Maps; Referrals/);
  assert.doesNotMatch(text, /Overall score|forecast|guaranteed revenue/);
});

const request = () => ({
  mode: 'cleaning_business_audit', answers: completeAnswers(), name: 'Dana', email: 'dana@example.com',
  businessName: 'Bright Home Cleaning', role: 'Owner', pagePath: '/free-audit',
  submissionId: 'business-audit-test-123456', sessionId: 'business-session-123456', tracking: { utm_source: 'test' },
});
const env = { KOBOILLM_API_KEY: 'test-report-credential' };
let requestNumber = 0;

const draft = () => ({
  bigPicture: 'Your existing enquiries may be worth another look.', overview: 'Your answers show a small team with several sources of new work.',
  findings: [
    { heading: 'You return missed calls within the hour.', body: 'You report missing 0 to 2 calls a week and calling back within the hour. That gives callers another chance to speak to you. It does not prove every caller books, but this is a useful habit worth protecting as your business grows.', evidenceIds: ['A5', 'A6'] },
    { heading: 'Quiet quotes receive no follow-up.', body: 'You selected nothing when asked what happens after a quote goes quiet. Some people may have chosen another cleaner, while others may still be deciding. Your existing enquiries could be worth a closer look before treating every quiet conversation as finished.', evidenceIds: ['A9'] },
    { heading: 'Your older enquiries have not been revisited.', body: 'You report under 100 old quotes or enquiries and say you have never messaged that list. The answers do not establish their age, quality, or contact permissions. Some may still be worth reviewing, but no bookings or revenue can be assumed from that list.', evidenceIds: ['A10', 'A11'] },
  ],
  whyThisMatters: 'Some quiet conversations may still have value. We can help you understand which opportunities are worth exploring.',
  nextConversation: 'Let us review the actual records together and see what makes sense for your business.',
});
const modelResponse = (content: unknown = draft(), finishReason = 'stop') => Response.json({ choices: [{ finish_reason: finishReason, message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }] });


test('both audit routes generate a report with no capture service or email configuration', async (t) => {
  const calls = t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    assert.ok(String(url).endsWith('/chat/completions'));
    return modelResponse();
  });
  for (const pagePath of ['/free-audit', '/free-audit-ads']) {
    const result = await handleAudit({ ...request(), pagePath }, 'business-audit-' + ++requestNumber, env);
    assert.equal(result.status, 200);
    assert.equal(result.body.report?.findings.length, 3);
    assert.equal(result.body.report?.illustrativeOpportunity, NO_RELIABLE_ESTIMATE);
    assert.equal(result.body.reportEmailSent, false);
    assert.ok(!('leadSaved' in result.body));
  }
  assert.equal(calls.mock.callCount(), 1, 'reports reuse the short-lived model cache');
});

test('Gmail sends the complete report and only a Google message ID confirms delivery', async (t) => {
  const emailEnv = { ...env, ...{ GMAIL_AUDIT_REPORTS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret', GMAIL_REFRESH_TOKEN: 'test-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com' } };
  for (const accepted of [true, false]) {
    let mime = '';
    let sends = 0;
    t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, options?: RequestInit) => {
      if (String(url).endsWith('/chat/completions')) return modelResponse();
      if (String(url) === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'test-access', token_type: 'Bearer' });
      assert.equal(String(url), 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
      sends++;
      mime = Buffer.from(JSON.parse(String(options?.body)).raw, 'base64url').toString('utf8');
      return accepted ? Response.json({ id: 'gmail-accepted' }) : new Response('private error', { status: 403 });
    });
    const result = await handleAudit({ ...request(), submissionId: 'gmail-report-test-' + accepted }, 'business-audit-' + ++requestNumber, emailEnv);
    assert.equal(result.status, 200);
    assert.equal(result.body.reportEmailSent, accepted);
    assert.equal(sends, 1);
    assert.match(mime, /To: dana@example.com/);
    assert.ok(mime.includes('Content-Type: text/html'));
    const encoded = mime.split('Content-Type: text/plain; charset=UTF-8')[1].split('\r\n\r\n')[1].split('\r\n--')[0];
    const text = Buffer.from(encoded, 'base64').toString('utf8');
    for (const finding of draft().findings) assert.ok(text.includes(finding.body));
    assert.match(text, /THE NEXT CONVERSATION/);
    assert.doesNotMatch(JSON.stringify(result), /private error|test-secret|test-refresh|test-access/);
    t.mock.restoreAll();
  }
});

test('invalid business-audit answers and contact data are rejected before any external call', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected external call'); });
  for (const changes of [
    { answers: {} }, { answers: { ...completeAnswers(), A3: ['Referrals', 'Social media', 'Repeat clients'] } },
    { email: 'invalid' }, { name: ' ' }, { role: '' }, { businessName: 'x'.repeat(161) }, { pagePath: '/unrelated' },
  ]) {
    const result = await handleAudit({ ...request(), ...changes }, `business-audit-${++requestNumber}`, env);
    assert.equal(result.status, 400);
  }
  assert.equal(mock.mock.callCount(), 0);
  assert.equal((await handleAudit(request(), `business-audit-${++requestNumber}`, {})).status, 503);
});

test('provider and malformed report failures preserve retry and never expose upstream credentials or errors', async (t) => {
  const responses = [
    () => new Response('private provider details', { status: 401 }),
    () => new Response('private provider details', { status: 429 }),
    () => { throw new DOMException('private request details', 'TimeoutError'); },
    () => modelResponse('not json'),
    () => modelResponse({ ...draft(), findings: [] }),
    () => modelResponse({ ...draft(), findings: draft().findings.map((finding) => ({ ...finding, evidenceIds: ['invented-id'] })) }),
    () => modelResponse({ ...draft(), nextConversation: '' }),
    () => modelResponse(draft(), 'length'),
    () => Response.json({ choices: [] }),
  ];
  for (const respond of responses) {
    t.mock.method(globalThis, 'fetch', async () => respond());
    const result = await handleAudit({ ...request(), businessName: 'Failure verification' }, `business-audit-${++requestNumber}`, env);
    assert.equal(result.status, 502);
    assert.equal(result.body.report, undefined);
    assert.ok(result.body.code?.startsWith('AUDIT_'));
    assert.doesNotMatch(JSON.stringify(result), /private|test-report-credential/);
    t.mock.restoreAll();
  }
});

test('simultaneous identical submissions reuse one generation and public responses keep contacts out of the report', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return modelResponse(); });
  const payload = { ...request(), businessName: 'Concurrent report verification', internalSummary: 'PRIVATE INTERNAL NOTE', fitScore: 99 };
  const captureEnv = { KOBOILLM_API_KEY: 'test-concurrent' };
  const results = await Promise.all([
    handleAudit(payload, `business-audit-${++requestNumber}`, captureEnv),
    handleAudit(payload, `business-audit-${++requestNumber}`, captureEnv),
  ]);
  assert.equal(calls, 1);
  for (const result of results) {
    assert.equal(result.status, 200);
    assert.doesNotMatch(JSON.stringify(result.body.report), /PRIVATE INTERNAL NOTE|dana@example.com|fitScore/);
  }
});

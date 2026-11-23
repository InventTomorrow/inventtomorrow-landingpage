import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runInNewContext } from 'node:vm';
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
const env = { KOBOILLM_API_KEY: 'test-report-credential', N8N_WEBHOOK_TEST_URL: 'https://webhook.example.test/audit', N8N_BUSINESS_AUDIT_CAPTURE: 'true' };
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

const workflow: any = JSON.parse(fs.readFileSync(new URL('../../docs/n8n-business-audit-workflow.json', import.meta.url), 'utf8'));
const node = (name: string) => {
  const found = workflow.nodes.find((candidate: any) => candidate.name === name);
  assert.ok(found, `Missing workflow node: ${name}`);
  return found;
};
const context = (input: unknown, normalized?: unknown) => ({
  $json: input, $input: { first: () => ({ json: input }) },
  $: (name: string) => { assert.equal(name, 'Structure Fields2'); return { first: () => ({ json: normalized }) }; },
});
const expression = (source: string, normalized: unknown) => runInNewContext(source.slice(3, -2), context(normalized, normalized));

test('both audit routes persist all 16 responses through the real n8n capture branch before acknowledgement', async (t) => {
  assert.equal(workflow.active, false);
  for (const pagePath of ['/free-audit', '/free-audit-ads']) {
    let payload: any;
    t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, options?: RequestInit) => {
      if (String(_url).endsWith('/chat/completions')) {
        const modelInput = JSON.parse(String(options?.body));
        assert.equal(modelInput.messages[0].role, 'system');
        assert.match(modelInput.messages[0].content, /Senior Cleaning Business Audit Consultant/);
        assert.equal(modelInput.messages[1].role, 'user');
        assert.equal(JSON.parse(modelInput.messages[1].content).auditResponses.length, 16);
        assert.ok(!modelInput.messages[1].content.includes('dana@example.com'), 'contact email is not needed by the model');
        return modelResponse();
      }
      payload = JSON.parse(String(options?.body));
      const normalized = runInNewContext(`(function () { ${node('Structure Fields2').parameters.jsCode} })()`, context({ body: payload }))[0].json;
      assert.equal(normalized.audit_complete, false, 'legacy estimates are never activated');
      assert.equal(normalized.sheet['Audit Complete'], 'Yes');
      assert.equal(normalized.business_audit.responses.length, 16);
      assert.equal(normalized.Phone_Number, '');
      assert.equal(normalized.Appointment_dateTime, '');
      assert.equal(normalized.sheet['Company Size'], 'Just me');
      assert.match(normalized.Appointment_message, /\(A17\)/);
      for (const question of BUSINESS_AUDIT_QUESTIONS) assert.ok(normalized.Appointment_message.includes(question.text));
      const columns = node('Form-Bookings-sheet4').parameters.columns.value;
      const savedValues = Object.values(columns).filter((value): value is string => typeof value === 'string').map((value) => expression(value, normalized));
      assert.ok(savedValues.includes(normalized.Appointment_message), 'all answers are mapped into the saved sheet row');
      const route = node('Route Cleaning Business Audit').parameters.conditions.conditions[0];
      assert.equal(expression(route.leftValue, normalized), route.rightValue);
      return Response.json(JSON.parse(expression(node('Confirm Cleaning Business Audit Saved').parameters.responseBody, normalized)));
    });
    const result = await handleAudit({ ...request(), pagePath, companySize: 'forged', fitScore: 100, scorecard: { overall: 100 } }, `business-audit-${++requestNumber}`, env);
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
    assert.equal(result.body.submissionId, request().submissionId);
    assert.equal(result.body.reportEmailSent, false);
    assert.equal(result.body.leadSaved, true);
    assert.equal(result.body.report?.findings.length, 3);
    assert.equal(result.body.report?.illustrativeOpportunity, NO_RELIABLE_ESTIMATE);
    assert.equal(result.body.report?.business.standardCleanPrice, 'Under $120');
    assert.equal(result.body.scorecard, undefined);
    assert.equal(payload.event, 'cleaning_business_audit_completed');
    assert.equal(payload.source, 'form_data');
    assert.equal(payload.pagePath, pagePath);
    assert.equal(payload.lead.companySize, 'Just me', 'company size comes from A1');
    assert.equal(payload.utm_source, 'test');
    assert.equal(payload.businessAudit.version, 1);
    assert.deepEqual(payload.businessAudit.answers, completeAnswers());
    assert.deepEqual(payload.auditReportInput, { businessName: request().businessName, auditResponses: businessAuditResponses(completeAnswers()) });
    assert.equal(payload.scorecard, undefined);
    assert.equal(payload.scorecardEmail, undefined);
    assert.equal(payload.auditReport.findings.length, 3);
    assert.equal(payload.fitScore, undefined);
    assert.equal(payload.smsConsent.granted, false);
    t.mock.restoreAll();
  }
  const edges = (name: string, index = 0) => workflow.connections[name]?.main[index]?.map((edge: any) => edge.node);
  assert.deepEqual(edges('Form-Bookings-sheet4'), ['Route Cleaning Business Audit']);
  assert.deepEqual(edges('Route Cleaning Business Audit'), ['Route Server Gmail Delivery']);
  assert.deepEqual(edges('Route Server Gmail Delivery'), ['Confirm Cleaning Business Audit Saved']);
  assert.deepEqual(edges('Route Server Gmail Delivery', 1), ['Get Existing Business Audit Email']);
  assert.deepEqual(edges('Route Cleaning Business Audit', 1), ['Route Readiness Report']);
  assert.equal(edges('Confirm Cleaning Business Audit Saved'), undefined, 'no legacy emails or SMS follow the confirmation');
  assert.deepEqual(edges('Get Existing Business Audit Email'), ['If Business Audit Email Sent']);
  assert.deepEqual(edges('If Business Audit Email Sent'), ['Confirm Business Audit Email Sent']);
  assert.deepEqual(edges('If Business Audit Email Sent', 1), ['Prepare Business Audit Email']);
  assert.deepEqual(edges('Prepare Business Audit Email'), ['Send Full Business Audit']);
  assert.deepEqual(edges('Send Full Business Audit'), ['Record Business Audit Email Sent']);
  assert.deepEqual(edges('Record Business Audit Email Sent'), ['Confirm Business Audit Email Sent']);
  assert.deepEqual(edges('Send Full Business Audit', 1), ['Confirm Cleaning Business Audit Saved']);
  assert.deepEqual(edges('Record Business Audit Email Sent', 1), ['Confirm Cleaning Business Audit Saved']);
  assert.equal(node('Record Business Audit Email Sent').parameters.columns.value['Email Status'], 'BUSINESS_AUDIT_SENT');
});

test('the full report email and sent confirmation target the submitted recipient and require successful delivery', async (t) => {
  for (const [sent, recipient, submissionId, saved, expected] of [
    [true, 'dana@example.com', request().submissionId, true, true],
    [true, 'DANA@example.com', request().submissionId, true, true],
    [true, 'someone-else@example.com', request().submissionId, true, false],
    [false, 'dana@example.com', request().submissionId, true, false],
    ['true', 'dana@example.com', request().submissionId, true, false],
    [true, 'dana@example.com', 'other-submission', true, false],
    [true, 'dana@example.com', request().submissionId, false, false],
  ] as const) {
    t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, options?: RequestInit) => {
      if (String(url).endsWith('/chat/completions')) return modelResponse();
      const payload = JSON.parse(String(options?.body));
      assert.match(payload.businessAuditEmail.text, /THE BIG PICTURE/);
      assert.match(payload.businessAuditEmail.text, /THE NEXT CONVERSATION/);
      for (const finding of draft().findings) assert.ok(payload.businessAuditEmail.text.includes(finding.body));
      const normalized = runInNewContext(`(function () { ${node('Structure Fields2').parameters.jsCode} })()`, context({ body: payload }))[0].json;
      const prepared = runInNewContext(`(function () { ${node('Prepare Business Audit Email').parameters.jsCode} })()`, context({}, normalized))[0].json;
      assert.equal(prepared.toEmail, 'dana@example.com');
      assert.equal(prepared.text, payload.businessAuditEmail.text);
      const confirmation = JSON.parse(expression(node('Confirm Business Audit Email Sent').parameters.responseBody, normalized));
      assert.equal(confirmation.report_email_sent, true);
      assert.equal(confirmation.report_email_to, 'dana@example.com');
      return Response.json({ success: true, submission_id: submissionId, business_audit_saved: saved, report_email_sent: sent, report_email_to: recipient });
    });
    const result = await handleAudit(request(), `business-audit-${++requestNumber}`, env);
    assert.equal(result.status, 200);
    assert.equal(result.body.reportEmailSent, expected);
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

test('direct Gmail delivers the complete report without n8n and only confirms Google acceptance', async (t) => {
  const gmailEnv = { KOBOILLM_API_KEY: 'test-gmail-report', GMAIL_AUDIT_REPORTS_ENABLED: 'true',
    GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret', GMAIL_REFRESH_TOKEN: 'test-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com' };
  for (const accepted of [true, false]) {
    let sends = 0;
    t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, options?: RequestInit) => {
      if (String(url).endsWith('/chat/completions')) return modelResponse();
      if (String(url) === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'test-access', token_type: 'Bearer' });
      assert.equal(String(url), 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
      sends++;
      const mime = Buffer.from(JSON.parse(String(options?.body)).raw, 'base64url').toString('utf8');
      assert.match(mime, /To: dana@example.com\r\n/);
      const encodedText = mime.match(/Content-Type: text\/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+/=\r\n]+)(?=\r\n--)/)?.[1];
      assert.ok(encodedText);
      const text = Buffer.from(encodedText, 'base64').toString('utf8');
      for (const finding of draft().findings) assert.ok(text.includes(finding.body));
      assert.match(text, /THE NEXT CONVERSATION/);
      assert.match(mime, /Content-Type: text\/html; charset=UTF-8/);
      assert.match(mime, /Content-ID: <audit-hero@inventtomorrow.pro>/);
      return accepted ? Response.json({ id: 'gmail-accepted' }) : new Response('private error', { status: 403 });
    });
    const result = await handleAudit({ ...request(), submissionId: `direct-gmail-accepted-${accepted}` }, `business-audit-${++requestNumber}`, gmailEnv);
    assert.equal(result.status, 200);
    assert.ok(result.body.report);
    assert.equal(result.body.reportEmailSent, accepted);
    assert.equal(result.body.leadSaved, false, 'sending email does not imply a saved CRM lead');
    assert.equal(sends, 1);
    assert.doesNotMatch(JSON.stringify(result), /private error|test-secret|test-refresh|test-access/);
    t.mock.restoreAll();
  }
});

test('optional n8n capture skips its email branch when the server owns Gmail delivery', async (t) => {
  let captureCalls = 0;
  let sendCalls = 0;
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, options?: RequestInit) => {
    if (String(url).endsWith('/chat/completions')) return modelResponse();
    if (String(url) === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'test-access', token_type: 'Bearer' });
    if (String(url) === 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send') { sendCalls++; return Response.json({ id: 'gmail-accepted' }); }
    captureCalls++;
    const payload = JSON.parse(String(options?.body));
    assert.equal(payload.businessAuditEmail.delivery, 'server_gmail');
    const normalized = runInNewContext(`(function () { ${node('Structure Fields2').parameters.jsCode} })()`, context({ body: payload }))[0].json;
    const route = node('Route Server Gmail Delivery').parameters.conditions.conditions[0];
    assert.equal(expression(route.leftValue, normalized), route.rightValue, 'take saved-only branch; no n8n email is sent');
    return Response.json(JSON.parse(expression(node('Confirm Cleaning Business Audit Saved').parameters.responseBody, normalized)));
  });
  const result = await handleAudit({ ...request(), submissionId: 'direct-gmail-plus-capture' }, `business-audit-${++requestNumber}`, {
    ...env, GMAIL_AUDIT_REPORTS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret',
    GMAIL_REFRESH_TOKEN: 'test-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com',
  });
  assert.equal(result.body.leadSaved, true);
  assert.equal(result.body.reportEmailSent, true);
  assert.equal(captureCalls, 1);
  assert.equal(sendCalls, 1);
});

test('stale or failing optional capture cannot block the report or falsely confirm a saved lead', async (t) => {
  for (const response of [
    () => Response.json({ success: true, submission_id: request().submissionId }),
    () => Response.json({ success: true, submission_id: 'other-submission', business_audit_saved: true }),
    () => Response.json({ success: true, submission_id: request().submissionId, business_audit_saved: 'true' }),
    () => new Response('', { status: 200 }),
    () => new Response('unavailable', { status: 500 }),
  ]) {
    t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => String(url).endsWith('/chat/completions') ? modelResponse() : response());
    const result = await handleAudit(request(), `business-audit-${++requestNumber}`, env);
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
    assert.equal(result.body.leadSaved, false);
    assert.ok(result.body.report);
    t.mock.restoreAll();
  }
});

test('reports work with no webhook and do not contact an older delivery flow by default', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    assert.ok(String(url).endsWith('/chat/completions'));
    calls++;
    return modelResponse();
  });
  for (const captureEnv of [
    { KOBOILLM_API_KEY: 'test-no-webhook' },
    { KOBOILLM_API_KEY: 'test-no-webhook', N8N_WEBHOOK_TEST_URL: env.N8N_WEBHOOK_TEST_URL },
  ]) {
    const result = await handleAudit({ ...request(), businessName: 'No webhook needed' }, `business-audit-${++requestNumber}`, captureEnv);
    assert.equal(result.status, 200);
    assert.ok(result.body.report);
    assert.equal(result.body.leadSaved, false);
  }
  assert.equal(calls, 1, 'unchanged retries reuse the short-lived report cache');
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

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'node:test';
import { runInNewContext } from 'node:vm';
import auditHandler from '../api/audit.ts';
import {
  calculateAudit, CLEAN_PRICE_OPTIONS, COMPANY_SIZE_OPTIONS, FOUNDING_SPOTS_LEFT,
  MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS,
} from '../src/utils/freeAudit.ts';
import { AUDIT_EMAIL_SYSTEM_PROMPT } from '../server/auditPrompts.ts';

const workflow = JSON.parse(await readFile(new URL('../docs/n8n-free-audit-workflow.json', import.meta.url), 'utf8'));
const node = (name) => {
  const found = workflow.nodes.find((candidate) => candidate.name === name);
  assert.ok(found, `Missing workflow node: ${name}`);
  return found;
};
const plain = (value) => JSON.parse(JSON.stringify(value));
function context(input, records = {}) {
  return {
    $json: input,
    $input: { first: () => ({ json: input }), all: () => [{ json: input }] },
    $: (name) => {
      assert.ok(name in records, `Missing upstream record: ${name}`);
      return { first: () => ({ json: records[name] }) };
    },
  };
}
function executeCode(name, input, records) {
  return plain(runInNewContext(`(function () { ${node(name).parameters.jsCode} })()`, context(input, records)));
}
function expression(value, input = {}, records = {}) {
  assert.ok(value.startsWith('={{') && value.endsWith('}}'));
  return runInNewContext(value.slice(3, -2).trim(), context(input, records));
}
function acknowledgement(normalized) {
  return JSON.parse(expression(node('Return Audit Result to Website').parameters.responseBody, {}, { 'Structure Fields': normalized }));
}
const outgoing = (name, branch = 0) => workflow.connections[name]?.main[branch]?.map((edge) => edge.node) ?? [];
const answers = {
  businessName: 'Bright Home Cleaning', missedCalls: MISSED_CALL_OPTIONS[1],
  oldQuotes: OLD_QUOTE_OPTIONS[1], typicalClean: CLEAN_PRICE_OPTIONS[1],
};
const quick = {
  mode: 'quick_audit', pagePath: '/free-audit-ads', submissionId: 'workflow-test-submission-123', sessionId: 'ads-browser-session',
  answers, email: 'dana@example.com', phone: '(202) 234-5678',
  website: 'https://brightclean.example', companySize: COMPANY_SIZE_OPTIONS[1],
};
const normalizedFixture = () => executeCode('Structure Fields', { body: {
  source: 'form_data', event: 'quick_audit_completed', submissionId: quick.submissionId,
  sessionId: quick.sessionId, timestamp: '2026-11-13T12:00:00Z', pagePath: quick.pagePath,
  answers, lead: { businessName: answers.businessName, email: quick.email, phone: '+12022345678', website: quick.website, companySize: quick.companySize },
  smsConsent: { granted: true, text: 'Reply STOP to opt out.' },
} })[0].json;

beforeEach((t) => {
  const keys = ['N8N_WEBHOOK_URL', 'N8N_WEBHOOK_TEST_URL', 'N8N_USE_PRODUCTION', 'VERCEL_ENV'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  process.env.N8N_WEBHOOK_TEST_URL = 'https://mock-n8n.test/webhook';
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected external request'); });
});

let request = 0;
async function invoke(input) {
  const response = {
    statusCode: 200, headers: {}, body: undefined,
    status(value) { this.statusCode = value; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    json(value) { this.body = value; },
  };
  await auditHandler({ method: 'POST', body: input, headers: { 'x-forwarded-for': `workflow-test-${++request}` } }, response);
  return response;
}

test('the shared workflow persists before acknowledging and begins customer delivery after acknowledgement', () => {
  assert.equal(workflow.active, false, 'Import requires deliberate activation with real delivery credentials');
  assert.equal(node('Webhook').parameters.responseMode, 'responseNode');
  assert.deepEqual(outgoing('Structure Fields'), ['Form-Bookings-sheet']);
  assert.deepEqual(outgoing('Form-Bookings-sheet'), ['Return Audit Result to Website']);
  assert.deepEqual(outgoing('Return Audit Result to Website'), ['Get row(s) in sheet', 'If Team Alert Configured', 'SMS Payload (connect your provider)']);
  assert.deepEqual(outgoing('Get row(s) in sheet'), ['If Email Already Sent']);
  assert.deepEqual(outgoing('If Email Already Sent', 0), [], 'Already sent emails must not be sent again');
  assert.deepEqual(outgoing('If Email Already Sent', 1), ['If Full Audit']);
  assert.deepEqual(outgoing('If Full Audit', 0), ['Check Audit Email Setup']);
  assert.deepEqual(outgoing('Check Audit Email Setup'), ['Email Writer']);
  assert.deepEqual(outgoing('Email Writer'), ['Structure Email']);
  assert.deepEqual(outgoing('Send a message'), ['Form-Bookings-sheet1']);
  assert.equal(node('Email Writer').parameters.responses.values[0].content, AUDIT_EMAIL_SYSTEM_PROMPT);
  assert.equal(node('Send a message').parameters.emailType, 'text');
  assert.deepEqual(node('Form-Bookings-sheet').parameters.columns.matchingColumns, ['Session ID']);
  assert.equal(node('Form-Bookings-sheet').parameters.columns.value['Email Status'], undefined, 'Lead retry must preserve SENT state');
  for (const [name, connection] of Object.entries(workflow.connections)) {
    node(name);
    for (const branch of connection.main) for (const edge of branch) node(edge.node);
  }
});

test('all 100 answer combinations survive API → n8n Code → webhook response → API with identical calculations', async () => {
  let calls = 0;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    assert.equal(url, process.env.N8N_WEBHOOK_TEST_URL);
    const payload = JSON.parse(options.body);
    const normalized = executeCode('Structure Fields', { body: payload })[0].json;
    const expected = calculateAudit(payload.answers);
    assert.deepEqual(normalized.audit_results, {
      business_name: payload.answers.businessName, missed_calls_month: expected.missedCallsMonth,
      missed_call_value: expected.missedCallValue, old_quotes_number: expected.oldQuotesNumber,
      revival_value: expected.revivalValue, guarantee_status: expected.guaranteeStatus, estimates_are_rough: true,
    });
    assert.equal(normalized.audit_payload.missed_call_value, expected.missedCallValue);
    assert.equal(normalized.audit_payload.revival_value, expected.revivalValue);
    assert.equal(normalized.audit_payload.founding_spots_left, FOUNDING_SPOTS_LEFT);
    assert.equal(normalized.audit_payload.subject_opportunity,
      expected.revivalValue !== null && expected.revivalValue > expected.missedCallValue ? 'old_quotes' : 'missed_calls');
    calls++;
    return Response.json(acknowledgement(normalized));
  });
  for (const missedCalls of MISSED_CALL_OPTIONS) for (const oldQuotes of OLD_QUOTE_OPTIONS) for (const typicalClean of CLEAN_PRICE_OPTIONS) {
    const picked = { ...answers, missedCalls, oldQuotes, typicalClean };
    const response = await invoke({ ...quick, answers: picked, pagePath: calls % 2 ? '/free-audit' : '/free-audit-ads' });
    assert.equal(response.statusCode, 200, JSON.stringify(picked));
    assert.deepEqual(response.body, { success: true, submissionId: quick.submissionId, results: calculateAudit(picked) });
  }
  assert.equal(calls, 100);
  // Whole-number months, matching the live n8n workflow (docs/n8n-live-workflow.json).
  assert.equal(calculateAudit({ ...answers, missedCalls: MISSED_CALL_OPTIONS[0] }).missedCallsMonth, 13);
  assert.equal(calculateAudit({ ...answers, missedCalls: MISSED_CALL_OPTIONS[2] }).missedCallsMonth, 99);
  assert.equal(calculateAudit({ ...answers, missedCalls: MISSED_CALL_OPTIONS[3] }).missedCallsMonth, 151);
});

test('ads attribution, browser identity and consent reach the stored row and SMS handoff together', async () => {
  const tracking = {
    utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'free-audit', utm_term: 'cleaners', utm_content: 'video-a', utm_id: 'ad-123',
    gclid: 'google-click', fbclid: 'facebook-click', msclkid: 'bing-click',
  };
  let normalized;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    normalized = executeCode('Structure Fields', { body: JSON.parse(options.body) })[0].json;
    return Response.json(acknowledgement(normalized));
  });
  const response = await invoke({ ...quick, noWebsite: true, website: '', answers: { ...answers, oldQuotes: 'Not sure' }, tracking: { ...tracking, internal: 'discard' } });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(normalized.tracking, tracking);
  assert.equal(normalized.sessionId, quick.sessionId);
  assert.equal(normalized.session_id, quick.submissionId);
  assert.equal(normalized.audit_payload.website, 'none');
  assert.equal(normalized.audit_results.old_quotes_number, null);
  assert.equal(normalized.audit_results.revival_value, null);
  assert.equal(normalized.audit_results.guarantee_status, 'none');
  assert.equal(normalized.sms_consent, true);
  assert.match(normalized.sms_consent_text, /Reply STOP to opt out/);
  assert.ok(Number.isFinite(Date.parse(normalized.sms_consent_at)));
  const columns = node('Form-Bookings-sheet').parameters.columns.value;
  const row = Object.fromEntries(Object.entries(columns).map(([key, value]) => [key, expression(value, normalized)]));
  assert.equal(row['Visitor Session ID'], quick.sessionId);
  assert.equal(row['Session ID'], quick.submissionId);
  assert.equal(row['UTM Term'], tracking.utm_term);
  assert.equal(row['UTM Content'], tracking.utm_content);
  assert.equal(row['UTM ID'], tracking.utm_id);
  assert.equal(row.GCLID, tracking.gclid);
  assert.equal(row.FBCLID, tracking.fbclid);
  assert.equal(row.MSCLKID, tracking.msclkid);
  assert.equal(row['SMS Consent'], 'Yes');
  assert.equal(row['SMS Consent Text'], normalized.sms_consent_text);
  const sms = executeCode('SMS Payload (connect your provider)', {}, { 'Structure Fields': normalized })[0].json;
  assert.equal(sms.to, '+12022345678');
  assert.equal(sms.submission_id, quick.submissionId);
  assert.equal(sms.idempotency_key, `${quick.submissionId}:audit-sms`);
  assert.match(sms.message, /free 15-minute call/);
  assert.deepEqual(executeCode('SMS Payload (connect your provider)', {}, { 'Structure Fields': { ...normalized, sms_consent: false } }), []);
});

test('appointment requests retain their chosen US zone and never acquire quick-audit estimates', async () => {
  let normalized;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    normalized = executeCode('Structure Fields', { body: JSON.parse(options.body) })[0].json;
    return Response.json(acknowledgement(normalized));
  });
  const response = await invoke({
    name: 'Dana', businessName: answers.businessName, email: quick.email, phone: quick.phone,
    'appointment datetime': '2099-12-15T14:30', appointmentTimeZone: 'America/Los_Angeles',
    pagePath: '/free-audit-ads', submissionId: quick.submissionId, sessionId: quick.sessionId,
  });
  assert.deepEqual(response.body, { success: true, submissionId: quick.submissionId });
  assert.equal(response.statusCode, 200);
  assert.equal(normalized.audit_complete, false);
  assert.equal(normalized.Appointment_dateTime, '2099-12-15 14:30 (America/Los_Angeles)');
  assert.equal(normalized.audit_results.missed_calls_month, null);
  assert.equal(normalized.audit_results.missed_call_value, null);
  assert.equal(normalized.audit_results.old_quotes_number, null);
  assert.equal(normalized.audit_results.revival_value, null);
  assert.equal(acknowledgement(normalized).audit, null);
  assert.deepEqual(executeCode('SMS Payload (connect your provider)', {}, { 'Structure Fields': normalized }), []);
  const email = executeCode('Appointment Request Email', {}, { 'Structure Fields': normalized })[0].json;
  assert.equal(email.email_kind, 'appointment_request');
  assert.match(email.text, /Requested date and time: 2099-12-15 14:30 \(America\/Los_Angeles\)/);
  assert.doesNotMatch(email.text, /\$[\d,]+|appointment (?:is )?confirmed/i);
});

test('stale and duplicate chat snapshots acknowledge without overwriting the stored conversation', () => {
  const incoming = {
    'Session ID': 'browser', 'Conversation ID': 'browser:/free-audit-ads', Version: 4,
    Chat: 'latest incoming chat', 'Contact Detials': '', 'Main Concern': '',
  };
  for (const version of [4, 5]) {
    const record = executeCode('Keep newest chat', { ...incoming, Version: version }, { 'Structure Output1': { ...incoming } })[0].json;
    assert.equal(record.skip_write, true);
    const conditions = node('If Chat Already Saved').parameters.conditions.conditions[0];
    assert.equal(expression(conditions.leftValue, record), conditions.rightValue);
    assert.deepEqual(outgoing('If Chat Already Saved', 0), ['Return Chat Saved']);
  }
  const record = executeCode('Keep newest chat', {
    ...incoming, Version: 3, 'Contact Detials': 'Email: dana@example.com', 'Main Concern': 'Missed calls', 'Lead Captured': 'Yes',
  }, { 'Structure Output1': { ...incoming } })[0].json;
  assert.equal(record.skip_write, undefined);
  assert.equal(record['Contact Detials'], 'Email: dana@example.com');
  assert.equal(record['Lead Captured'], 'Yes');
  assert.deepEqual(outgoing('If Chat Already Saved', 1), ['Chat_History']);
  assert.deepEqual(outgoing('Chat_History'), ['Return Chat Saved']);
});

function emailOutput(record) {
  return `SUBJECT: Bright Home: about $1,700 in old quotes\nBODY:\nHi there,

Thanks for taking the Invent Tomorrow audit. Here's what your answers point to:

- About 43 missed calls a month, which could be worth around $1,300 in cleans.
- About 125 old quotes that never booked, which could bring in about $1,700 if we revive them.

These are rough estimates. With a small crew, calls get missed mid-clean and quotes go quiet because nobody has time to chase them.

Here's what we'd do first:

- Quote Revival: we'd contact your old quotes with real open dates. One campaign like this booked 18 new jobs from old enquiries.
- Missed Call Rescue: every missed call gets a text from you within seconds, before they try the next cleaner.
- Quote Chaser: every new quote gets followed up, so the pile stops growing.

You're close to the 200 old quotes our Pays For Itself Guarantee needs. We can check that on the call.

Book your free 15-minute call and we'll go through your real numbers and the first fix:
${record.audit_payload.booking_link}

${record.audit_payload.sender_name}
Founder, Invent Tomorrow`;
}

test('email parsing accepts the specified output and rejects invented amounts or missing delivery details', () => {
  const record = normalizedFixture();
  const sample = emailOutput(record);
  const parse = (text) => executeCode('Structure Email', { output: [{ content: [{ type: 'output_text', text }] }] }, { 'Structure Fields': record });
  const email = parse(sample)[0].json;
  assert.equal(email.email_kind, 'audit_results');
  assert.equal(email.Email, quick.email);
  assert.match(email.text, /rough estimates/);
  for (const [invalid, expected] of [
    ['Only an unstructured response', /SUBJECT: and BODY:/],
    [sample.replaceAll('$1,700', '$99,999'), /invented a dollar figure/],
    [sample.replace('These are rough estimates.', 'This is your estimate.'), /missing estimates disclaimer/],
    [sample.replace(record.audit_payload.booking_link, 'https://invented.test/book'), /missing estimates disclaimer/],
    [sample.replace(record.audit_payload.sender_name, 'Invented Sender'), /missing estimates disclaimer/],
  ]) assert.throws(() => parse(invalid), expected);
  assert.throws(() => executeCode('Check Audit Email Setup', {}, { 'Structure Fields': record }), /mailing address and unsubscribe URL/);
  const configured = { ...record, settings: { businessMailingAddress: 'Example business address', unsubscribeLink: 'https://example.test/unsubscribe' } };
  assert.equal(executeCode('Check Audit Email Setup', {}, { 'Structure Fields': configured })[0].json.session_id, quick.submissionId);
  const sent = executeCode('Email HTML', { ...email, settings: configured.settings })[0].json;
  assert.equal(sent.toEmail, quick.email);
  assert.ok(sent.text.endsWith('Example business address\n\nUnsubscribe: https://example.test/unsubscribe'));
});

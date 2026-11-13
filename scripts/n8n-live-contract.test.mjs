// Contract between the website and the LIVE n8n workflow (docs/n8n-live-workflow.json)
// and its patched replacement (docs/n8n-live-workflow.patched.json, from
// scripts/patch-live-workflow.mjs). The real API builds each request; the real n8n
// Code nodes and expressions process it; the API then checks n8n's reply.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'node:test';
import { runInNewContext } from 'node:vm';
import auditHandler from '../api/audit.ts';
import chatHandler from '../api/chat.ts';
import {
  AUDIT_QUESTIONS, calculateAudit, CLEAN_PRICE_OPTIONS, COMPANY_SIZE_OPTIONS, MISSED_CALL_OPTIONS, OLD_QUOTE_OPTIONS,
} from '../src/utils/freeAudit.ts';

const load = async (file) => JSON.parse(await readFile(new URL(`../docs/${file}`, import.meta.url), 'utf8'));
const live = await load('n8n-live-workflow.json');
const patched = await load('n8n-live-workflow.patched.json');
const workflows = [['live', live], ['patched', patched]];
const EMAIL_NODES = ['Prepare Email Context1', 'Email Writer2', 'Structure Email2', 'Email HTML2', 'Send a message3', 'Form-Bookings-sheet5'];
const SMS = 'SMS Payload (connect your provider)';

const finder = (workflow) => (name) => {
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
const executeCode = (workflow, name, input, records) =>
  plain(runInNewContext(`(function () { ${finder(workflow)(name).parameters.jsCode} })()`, context(input, records)));
function expression(value, input = {}, records = {}) {
  assert.ok(value.startsWith('={{') && value.endsWith('}}'), value);
  return runInNewContext(value.slice(3, -2).trim(), context(input, records));
}
const outgoing = (workflow, name, branch = 0) => workflow.connections[name]?.main[branch]?.map((e) => e.node) ?? [];

// One n8n execution of the form branch: webhook body -> Structure Fields2 -> response node.
function runFormBranch(workflow, payload) {
  const condition = finder(workflow)('If Form Data2').parameters.conditions.conditions[0];
  assert.equal(expression(condition.leftValue, { body: payload }), condition.rightValue, 'form data must take the form branch');
  const normalized = executeCode(workflow, 'Structure Fields2', { body: payload })[0].json;
  const reply = expression(finder(workflow)('Return Audit Result to Website2').parameters.responseBody, normalized, { 'Structure Fields2': normalized });
  return { normalized, reply: JSON.parse(reply) };
}

const answers = {
  businessName: 'Bright Home Cleaning', missedCalls: MISSED_CALL_OPTIONS[1],
  oldQuotes: OLD_QUOTE_OPTIONS[1], typicalClean: CLEAN_PRICE_OPTIONS[1],
};
const quick = {
  mode: 'quick_audit', pagePath: '/free-audit-ads', submissionId: 'live-contract-submission-1', sessionId: 'live-contract-browser',
  answers, email: 'dana@example.com', phone: '(202) 234-5678', website: 'https://brightclean.example', companySize: COMPANY_SIZE_OPTIONS[1],
};
const tracking = {
  utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'free-audit', utm_term: 'cleaners', utm_content: 'video-a', utm_id: 'ad-123',
  gclid: 'google-click', fbclid: 'facebook-click', msclkid: 'bing-click',
};

beforeEach((t) => {
  const keys = ['N8N_WEBHOOK_URL', 'N8N_WEBHOOK_TEST_URL', 'N8N_USE_PRODUCTION', 'VERCEL_ENV', 'QSTASH_TOKEN', 'N8N_LOG_EVERY_MESSAGE', 'KOBOILLM_API_KEY'];
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
async function invoke(handler, body) {
  const response = {
    statusCode: 200, headers: {}, body: undefined,
    status(value) { this.statusCode = value; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    json(value) { this.body = value; },
  };
  await handler({ method: 'POST', body, headers: { 'x-forwarded-for': `live-contract-${++request}` } }, response);
  return response;
}

for (const [label, workflow] of workflows) {
  test(`${label}: all 100 answer combinations unlock the results with the numbers n8n calculated`, async () => {
    const seen = [];
    globalThis.fetch.mock.mockImplementation(async (_url, options) => {
      const { normalized, reply } = runFormBranch(workflow, JSON.parse(options.body));
      seen.push(normalized);
      return Response.json(reply);
    });
    for (const missedCalls of MISSED_CALL_OPTIONS) for (const oldQuotes of OLD_QUOTE_OPTIONS) for (const typicalClean of CLEAN_PRICE_OPTIONS) {
      const picked = { ...answers, missedCalls, oldQuotes, typicalClean };
      const response = await invoke(auditHandler, { ...quick, answers: picked });
      assert.equal(response.statusCode, 200, `${JSON.stringify(picked)} -> ${JSON.stringify(response.body)}`);
      assert.deepEqual(response.body, { success: true, submissionId: quick.submissionId, results: calculateAudit(picked) });
      const normalized = seen.at(-1);
      assert.equal(normalized.audit_complete, true);
      assert.equal(normalized.audit_payload.missed_calls_answer, missedCalls);
      assert.equal(normalized.audit_payload.old_quotes_answer, oldQuotes);
      assert.equal(normalized.audit_payload.typical_clean_answer, typicalClean);
    }
    assert.equal(seen.length, 100);
    // Free Audit.md worked example: 6-15 calls, 50-200 quotes, $120-$180 clean.
    assert.deepEqual(calculateAudit(answers), {
      missedCallsMonth: 43, missedCallValue: 1300, oldQuotesNumber: 125, revivalValue: 1700, guaranteeStatus: 'close',
    });
  });

  test(`${label}: lead fields, website without https, no website, page and session reach n8n`, async () => {
    let normalized;
    globalThis.fetch.mock.mockImplementation(async (_url, options) => {
      const run = runFormBranch(workflow, JSON.parse(options.body));
      normalized = run.normalized;
      return Response.json(run.reply);
    });
    let response = await invoke(auditHandler, { ...quick, website: 'brighthome.com', companySize: COMPANY_SIZE_OPTIONS[3] });
    assert.equal(response.statusCode, 200);
    assert.equal(normalized.Email, quick.email);
    assert.equal(normalized.Phone_Number, '+12022345678');
    assert.equal(normalized['Bussiness Name'], answers.businessName);
    assert.equal(normalized.audit_payload.website, 'https://brighthome.com/');
    assert.equal(normalized.audit_payload.company_size, COMPANY_SIZE_OPTIONS[3]);
    assert.equal(normalized.pagePath, quick.pagePath);
    assert.equal(normalized.session_id, quick.submissionId, 'sheet row key is the submission ID');
    assert.equal(normalized.chat_session_id, quick.sessionId, 'chat history is matched by the browser session ID');

    response = await invoke(auditHandler, { ...quick, website: '', noWebsite: true, answers: { ...answers, oldQuotes: 'Not sure' } });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.results.oldQuotesNumber, null);
    assert.equal(response.body.results.revivalValue, null);
    assert.equal(normalized.audit_payload.website, 'none');
    assert.equal(normalized.audit_results.revival_value, null);
    assert.equal(normalized.audit_results.guarantee_status, 'none');
  });

  test(`${label}: UTM tags reach n8n's record`, async () => {
    let normalized;
    globalThis.fetch.mock.mockImplementation(async (_url, options) => {
      const run = runFormBranch(workflow, JSON.parse(options.body));
      normalized = run.normalized;
      return Response.json(run.reply);
    });
    const response = await invoke(auditHandler, { ...quick, tracking: { ...tracking, internal: 'discard' } });
    assert.equal(response.statusCode, 200);
    // The live node reads these three; the patched one also reads the rest.
    assert.equal(normalized.utm_source, tracking.utm_source);
    assert.equal(normalized.utm_medium, tracking.utm_medium);
    assert.equal(normalized.utm_campaign, tracking.utm_campaign);
    assert.equal(normalized.internal, undefined);
    if (label === 'patched') for (const key of ['utm_term', 'utm_content', 'utm_id', 'gclid', 'fbclid', 'msclkid']) assert.equal(normalized[key], tracking[key], key);
  });

  test(`${label}: "Talk to a person" appointment requests are acknowledged and carry tracking`, async () => {
    let payload; let normalized;
    globalThis.fetch.mock.mockImplementation(async (_url, options) => {
      payload = JSON.parse(options.body);
      const run = runFormBranch(workflow, payload);
      normalized = run.normalized;
      return Response.json(run.reply);
    });
    const response = await invoke(auditHandler, {
      name: 'Dana', businessName: answers.businessName, email: quick.email, phone: quick.phone,
      'appointment datetime': '2099-12-15T14:30', appointmentTimeZone: 'America/Los_Angeles',
      pagePath: '/free-audit', submissionId: 'live-contract-appointment-1', sessionId: quick.sessionId, tracking,
    });
    assert.deepEqual(response.body, { success: true, submissionId: 'live-contract-appointment-1' });
    assert.equal(payload.utm_source, tracking.utm_source);
    assert.deepEqual(payload.tracking, tracking);
    assert.equal(normalized.audit_complete, false);
    assert.equal(normalized.Appointment_dateTime, '2099-12-15 14:30 (America/Los_Angeles)');
    assert.equal(normalized.utm_campaign, tracking.utm_campaign);
  });

  test(`${label}: a quiz finisher's chat log is saved as a captured lead`, async () => {
    const logs = [];
    globalThis.fetch.mock.mockImplementation(async (_url, options) => {
      logs.push(JSON.parse(options.body));
      return new Response('', { status: 200 }); // the chat branch has no Respond node
    });
    const messages = [
      { role: 'user', content: 'Book my free audit' }, { role: 'assistant', content: AUDIT_QUESTIONS[0] },
      { role: 'user', content: answers.businessName }, { role: 'assistant', content: AUDIT_QUESTIONS[1] },
      { role: 'user', content: answers.missedCalls }, { role: 'assistant', content: "Here's your quick audit, Bright Home Cleaning:" },
    ];
    const body = { mode: 'log', experience: 'guided-audit', messages, sessionId: quick.sessionId, pagePath: '/free-audit' };
    for (const state of [{ lead: null, askedDirect: false }, { lead: null, askedDirect: false, audit: { businessName: answers.businessName, email: quick.email, phone: quick.phone } }]) {
      const response = await invoke(chatHandler, { ...body, state });
      assert.equal(response.statusCode, 200);
      assert.equal(response.body.logSaved, true);
    }
    const condition = finder(workflow)('If Form Data2').parameters.conditions.conditions[0];
    assert.notEqual(expression(condition.leftValue, { body: logs[0] }), condition.rightValue, 'chat logs must take the chat branch');
    const [before, after] = logs.map((log) => executeCode(workflow, 'Structure Output2', { body: log })[0].json);
    assert.equal(before['Lead Captured'], 'No');
    assert.equal(after['Lead Captured'], 'Yes');
    assert.equal(after.Phone, '+12022345678');
    assert.equal(after.Email, quick.email);
    assert.equal(after['Business Name'], answers.businessName);
    assert.equal(after['Session ID'], quick.sessionId);
    const contact = expression(finder(workflow)('Chat_History2').parameters.columns.value['Contact Detials'], after);
    if (label === 'patched') assert.match(contact, /Phone: \+12022345678/);
    else assert.equal(contact, undefined, 'live maps a misspelt key, so the Contact column stays blank until the patch is imported');
  });
}

test('patched: saves before acknowledging, stores the full record and only changes the intended nodes', () => {
  const node = finder(patched);
  assert.deepEqual(outgoing(patched, 'Structure Fields2'), ['Form-Bookings-sheet4']);
  assert.deepEqual(outgoing(patched, 'Form-Bookings-sheet4'), ['Return Audit Result to Website2']);
  assert.deepEqual(outgoing(patched, 'Return Audit Result to Website2'), ['Get row(s) in sheet2']);
  assert.deepEqual(outgoing(patched, 'If Email Already Sent2', 0), []);
  assert.deepEqual(outgoing(patched, 'If Email Already Sent2', 1), ['Send a message', 'Prepare Email Context1', SMS]);
  assert.equal(node('Form-Bookings-sheet4').continueOnFail, undefined, 'a failed save must not be acknowledged');
  assert.equal(node('Form-Bookings-sheet4').retryOnFail, true);
  assert.deepEqual(node('Form-Bookings-sheet4').parameters.columns.matchingColumns, ['Session ID']);

  // Identity and delivery are untouched, so importing over the live workflow keeps the same URL and credentials.
  for (const key of ['id', 'name', 'versionId', 'settings']) assert.deepEqual(patched[key], live[key], key);
  const liveNode = finder(live);
  const changed = new Set(['Structure Fields2', 'Form-Bookings-sheet4', 'Return Audit Result to Website2', 'Chat_History2', 'Send a message']);
  for (const original of live.nodes) {
    if (!changed.has(original.name)) assert.deepEqual(node(original.name), original, `${original.name} must be unchanged`);
    else assert.deepEqual(node(original.name).credentials, original.credentials, `${original.name} keeps its credentials`);
  }
  for (const name of EMAIL_NODES) assert.deepEqual(node(name), liveNode(name), `${name} (email) must be unchanged`);
  assert.deepEqual(patched.nodes.map((n) => n.name).sort(), [...live.nodes.map((n) => n.name), SMS].sort());
  for (const [from, connection] of Object.entries(patched.connections)) {
    node(from);
    for (const branch of connection.main) for (const e of branch) node(e.node);
  }
});

test('patched: the sheet row, team alert and SMS hand-off carry the whole audit', async () => {
  let normalized;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    const run = runFormBranch(patched, JSON.parse(options.body));
    normalized = run.normalized;
    return Response.json(run.reply);
  });
  const response = await invoke(auditHandler, { ...quick, tracking });
  assert.equal(response.statusCode, 200);
  const columns = finder(patched)('Form-Bookings-sheet4').parameters.columns.value;
  const row = Object.fromEntries(Object.entries(columns).map(([key, value]) => [key, expression(value, normalized)]));
  assert.deepEqual({
    'Session ID': row['Session ID'], Email: row.Email, Phone_Number: row.Phone_Number, 'Bussiness Name': row['Bussiness Name'],
    Website: row.Website, 'Company Size': row['Company Size'],
    'Missed Calls Answer': row['Missed Calls Answer'], 'Old Quotes Answer': row['Old Quotes Answer'], 'Typical Clean Answer': row['Typical Clean Answer'],
    'Missed Calls per Month': row['Missed Calls per Month'], 'Missed Call Value': row['Missed Call Value'],
    'Old Quotes Number': row['Old Quotes Number'], 'Revival Value': row['Revival Value'], 'Guarantee Status': row['Guarantee Status'],
    'Audit Complete': row['Audit Complete'], 'Page Path': row['Page Path'], 'Visitor Session ID': row['Visitor Session ID'], Event: row.Event,
    'UTM Source': row['UTM Source'], 'UTM Medium': row['UTM Medium'], 'UTM Campaign': row['UTM Campaign'], 'UTM Term': row['UTM Term'],
    'UTM Content': row['UTM Content'], 'UTM ID': row['UTM ID'], GCLID: row.GCLID, FBCLID: row.FBCLID, MSCLKID: row.MSCLKID,
    'SMS Consent': row['SMS Consent'],
  }, {
    'Session ID': quick.submissionId, Email: quick.email, Phone_Number: '+12022345678', 'Bussiness Name': answers.businessName,
    Website: 'https://brightclean.example/', 'Company Size': quick.companySize,
    'Missed Calls Answer': answers.missedCalls, 'Old Quotes Answer': answers.oldQuotes, 'Typical Clean Answer': answers.typicalClean,
    'Missed Calls per Month': 43, 'Missed Call Value': 1300, 'Old Quotes Number': 125, 'Revival Value': 1700, 'Guarantee Status': 'close',
    'Audit Complete': 'Yes', 'Page Path': quick.pagePath, 'Visitor Session ID': quick.sessionId, Event: 'quick_audit_completed',
    'UTM Source': 'facebook', 'UTM Medium': 'paid', 'UTM Campaign': 'free-audit', 'UTM Term': 'cleaners',
    'UTM Content': 'video-a', 'UTM ID': 'ad-123', GCLID: 'google-click', FBCLID: 'facebook-click', MSCLKID: 'bing-click',
    'SMS Consent': 'Yes',
  });

  const alert = expression(finder(patched)('Send a message').parameters.text, {}, { 'Structure Fields2': normalized });
  for (const line of ['New quick audit lead', 'Business: Bright Home Cleaning', 'Email: dana@example.com', 'Phone: +12022345678',
    'Website: https://brightclean.example/', 'Company size: 2–4 cleaners', 'around $1,300 in cleans', 'around $1,700 if revived',
    'Guarantee: close', 'Page: /free-audit-ads', 'Ad: facebook / paid / free-audit']) assert.ok(alert.includes(line), `alert is missing "${line}":\n${alert}`);

  const sms = executeCode(patched, SMS, {}, { 'Structure Fields2': normalized });
  assert.equal(sms.length, 1);
  assert.equal(sms[0].json.to, '+12022345678');
  assert.equal(sms[0].json.idempotency_key, `${quick.submissionId}:audit-sms`);
  assert.match(sms[0].json.message, /Reply STOP to opt out/);
  assert.match(sms[0].json.consent.text, /Reply STOP to opt out/);
  assert.deepEqual(executeCode(patched, SMS, {}, { 'Structure Fields2': { ...normalized, sms_consent: false } }), []);
  assert.deepEqual(executeCode(patched, SMS, {}, { 'Structure Fields2': { ...normalized, audit_complete: false } }), []);
});

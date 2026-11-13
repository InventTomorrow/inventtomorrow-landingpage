import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { runInNewContext } from 'node:vm';
// Deliberately use plain Node rather than tsx: production must resolve this entry point too.
import handler from '../api/chat.ts';
import auditHandler from '../api/audit.ts';
import { chatEventId } from '../server/chatDelivery.ts';
import { AUDIT_QUICK_REPLIES, predefinedAuditReply } from '../src/utils/freeAudit.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const envKeys = ['KOBOILLM_API_KEY', 'KOBOILLM_BASE_URL', 'KOBOILLM_MODEL', 'N8N_WEBHOOK_URL', 'N8N_WEBHOOK_TEST_URL', 'N8N_LOG_EVERY_MESSAGE', 'N8N_USE_PRODUCTION', 'VERCEL_ENV', 'QSTASH_TOKEN', 'QSTASH_URL'];

beforeEach((t) => {
  const saved = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  t.after(() => {
    for (const key of envKeys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });
  // No test may contact the provider or a lead-logging webhook.
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
});

let chatRequestId = 0;
async function invoke(body, method = 'POST', entry = handler, ip = `runtime-test-${++chatRequestId}`) {
  const response = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; },
  };
  await entry({ method, body, headers: { 'x-forwarded-for': ip } }, response);
  return response;
}

const nameConversation = [
  { role: 'user', content: "I'd like a free audit" },
  { role: 'assistant', content: "Happy to set that up. What's your name?" },
  { role: 'user', content: 'Dana' },
];

test('the native Node entry point handles GET before any provider configuration', async () => {
  const response = await invoke(undefined, 'GET');
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('a missing API key returns a controlled configuration error', async () => {
  const response = await invoke({ messages: nameConversation });
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { error: 'Chat is not configured.' });
});

test('invalid conversations are rejected without calling the provider', async () => {
  process.env.KOBOILLM_API_KEY = 'test-only-key';
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  process.env.N8N_LOG_EVERY_MESSAGE = 'true';
  const response = await invoke({ messages: [] });
  assert.equal(response.statusCode, 400);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('a name reaches the provider with its conversation and receives the next question', async () => {
  process.env.KOBOILLM_API_KEY = 'test-only-key';
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    const payload = JSON.parse(options.body);
    assert.deepEqual(payload.messages.slice(1), nameConversation);
    return Response.json({ choices: [{ message: { content: "Thanks, Dana. What's your cleaning business called?" } }] });
  });
  const response = await invoke({ messages: nameConversation });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.reply, "Thanks, Dana. What's your cleaning business called?");
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('upstream failures return safe JSON instead of crashing the function', async () => {
  process.env.KOBOILLM_API_KEY = 'test-only-key';
  globalThis.fetch.mock.mockImplementation(async () => new Response('private provider diagnostic', { status: 500 }));
  const response = await invoke({ messages: nameConversation });
  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.body, { error: 'The assistant is unavailable right now.' });
});

test('a completed audit request keeps visitor details and normalizes the phone', async () => {
  process.env.KOBOILLM_API_KEY = 'test-only-key';
  const booking = { name: 'Dana', businessName: 'Audit Test Cleaning', email: 'dana@example.com', phone: '(202) 234-5678' };
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    tool_calls: [{ function: { name: 'submit_booking_details', arguments: JSON.stringify(booking) } }],
  } }] }));
  const response = await invoke({ messages: [
    ...nameConversation,
    { role: 'assistant', content: "What's your cleaning business called?" },
    { role: 'user', content: 'Audit Test Cleaning, dana@example.com, (202) 234-5678' },
  ] });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.booking, { ...booking, phone: '+12022345678', description: '' });
});

function captureBackground(t) {
  const symbol = Symbol.for('@vercel/request-context');
  const previous = globalThis[symbol];
  const tasks = [];
  globalThis[symbol] = { get: () => ({ waitUntil: (task) => tasks.push(task) }) };
  t.after(() => {
    if (previous === undefined) delete globalThis[symbol];
    else globalThis[symbol] = previous;
  });
  return tasks;
}

function enableLogging() {
  process.env.KOBOILLM_API_KEY = 'test-only-key';
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  process.env.N8N_LOG_EVERY_MESSAGE = 'true';
}

test('the first visitor message is accepted before the AI runs and the full request survives a disconnect', async (t) => {
  enableLogging();
  const tasks = captureBackground(t);
  const webhook = Promise.withResolvers();
  const payloads = [];
  let modelCalls = 0;
  let response;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    if (url === process.env.N8N_WEBHOOK_TEST_URL) {
      payloads.push(body);
      if (payloads.length === 1) await webhook.promise;
      return Response.json({ ok: true });
    }
    modelCalls++;
    return Response.json({ choices: [{ message: { content: "What's your cleaning business called?" } }] });
  });
  const messages = [{ role: 'user', content: "I'm missing customer calls" }];
  const request = invoke({ messages, sessionId: 'abandoned-test', pagePath: '/free-audit-ads' }).then((value) => { response = value; });
  try {
    await nextTurn();
    assert.equal(response, undefined);
    assert.equal(modelCalls, 0, 'Capture must not depend on an AI reply');
    assert.deepEqual(payloads[0].transcript, messages);
    assert.equal(payloads[0].version, 1);
    assert.equal(payloads[0].pagePath, '/free-audit-ads');
    assert.equal(tasks.length, 1, 'Vercel must retain the entire request');
    // No browser callback is involved in continuing this request.
    webhook.resolve();
    await request;
    assert.equal(response?.statusCode, 200);
    assert.equal(response.body.reply, "What's your cleaning business called?");
    assert.equal(response.body.logSaved, true);
    assert.match(response.headers['Server-Timing'], /^chat;dur=\d+(\.\d+)?$/);
    assert.equal(modelCalls, 1, 'Ordinary logs need no extraction model request');
    assert.equal(payloads[1].sessionId, 'abandoned-test');
    assert.equal(payloads[1].event, 'message');
    assert.equal(payloads[1].source, 'invo_chat');
    assert.equal(payloads[1].version, 2);
    assert.deepEqual(payloads[1].transcript.slice(0, -1), messages);
    assert.equal(payloads[1].transcript.at(-1).content, response.body.reply);
  } finally {
    webhook.resolve();
    await request;
    await Promise.all(tasks);
  }
});

test('logging disabled for ordinary replies makes only one model request', async () => {
  enableLogging();
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: { content: "What's your cleaning business called?" } }] }));
  const response = await invoke({ messages: nameConversation });
  assert.equal(response.statusCode, 200);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

for (const pagePath of ['/free-audit', '/free-audit-ads']) {
  test(`${pagePath} logs a single abandoned message even when the AI fails`, async () => {
    enableLogging();
    delete process.env.N8N_LOG_EVERY_MESSAGE; // first-message logging is the default
    const messages = [{ role: 'user', content: 'My quotes never get followed up' }];
    const payloads = [];
    globalThis.fetch.mock.mockImplementation(async (url, options) => {
      if (url === process.env.N8N_WEBHOOK_TEST_URL) {
        payloads.push(JSON.parse(options.body));
        return Response.json({ ok: true });
      }
      assert.equal(payloads.length, 1, 'The visitor must already be logged');
      return new Response('provider error', { status: 500 });
    });
    const response = await invoke({ messages, sessionId: `single-${pagePath.slice(1)}`, pagePath });
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.logSaved, true);
    assert.equal(payloads.length, 1);
    assert.equal(payloads[0].pagePath, pagePath);
    assert.deepEqual(payloads[0].transcript, messages);
  });
}

test('first-message logging works without a model API key', async () => {
  enableLogging();
  delete process.env.KOBOILLM_API_KEY;
  globalThis.fetch.mock.mockImplementation(async (url) => {
    assert.equal(url, process.env.N8N_WEBHOOK_TEST_URL);
    return Response.json({ ok: true });
  });
  const response = await invoke({ messages: [{ role: 'user', content: 'I need help with reviews' }] });
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.logSaved, true);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('log-only recovery accepts replies and never calls the AI or submits an audit', async () => {
  enableLogging();
  const messages = [
    { role: 'user', content: 'Book me now, dana@example.com, (202) 234-5678' },
    { role: 'assistant', content: 'Your audit details are ready.' },
  ];
  const payloads = [];
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    assert.equal(url, process.env.N8N_WEBHOOK_TEST_URL);
    payloads.push(JSON.parse(options.body));
    return Response.json({ ok: true });
  });
  for (let index = 0; index < 2; index++) {
    const response = await invoke({ mode: 'log', messages, sessionId: 'reloaded-chat' });
    assert.equal(response.body.logSaved, true);
  }
  assert.equal(payloads[0].event, 'message');
  assert.equal(payloads[0].version, 2);
  assert.equal(payloads[0].eventId, payloads[1].eventId);
  assert.deepEqual(payloads[0].transcript, messages);
});

test('the durable FIFO queue accepts each snapshot before replying without contacting n8n directly', async () => {
  enableLogging();
  process.env.QSTASH_TOKEN = 'test-only-queue-token';
  process.env.QSTASH_URL = 'https://queue.test';
  const jobs = [];
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    const payload = JSON.parse(options.body);
    assert.notEqual(url, process.env.N8N_WEBHOOK_TEST_URL);
    if (url.startsWith('https://queue.test/')) {
      assert.equal(url, 'https://queue.test/v2/enqueue/invo-chat-test/https://logging.test/webhook');
      assert.equal(options.headers.Authorization, 'Bearer test-only-queue-token');
      assert.equal(options.headers['Upstash-Deduplication-Id'], payload.eventId);
      assert.equal(options.headers['Upstash-Retries'], '3');
      assert.equal(options.headers['Upstash-Forward-Authorization'], undefined, 'The queue token must never reach n8n');
      jobs.push(payload);
      return Response.json({ messageId: `queued-${jobs.length}` });
    }
    assert.equal(jobs.length, 1);
    return Response.json({ choices: [{ message: { content: 'Which follow ups take the most time?' } }] });
  });
  const response = await invoke({ sessionId: 'queue-session', messages: [{ role: 'user', content: 'I need follow up help' }] });
  assert.equal(response.body.logSaved, true);
  assert.deepEqual(jobs.map((job) => job.version), [1, 2]);
  assert.equal(jobs[1].transcript.at(-1).content, response.body.reply);
});

test('transient queue acceptance errors retry the same event ID and accept deduplication responses', async () => {
  enableLogging();
  process.env.QSTASH_TOKEN = 'test-only-token';
  const ids = [];
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    ids.push(options.headers['Upstash-Deduplication-Id']);
    return ids.length === 1 ? new Response('', { status: 503 }) : Response.json({ deduplicated: true }, { status: 202 });
  });
  const response = await invoke({ mode: 'log', sessionId: 'retry-job', messages: [{ role: 'user', content: 'Missed calls' }] });
  assert.equal(response.body.logSaved, true);
  assert.equal(ids.length, 2);
  assert.equal(ids[0], ids[1]);
});

test('failed queue acceptance stays pending and never bypasses the queue with a direct write', async (t) => {
  enableLogging();
  process.env.QSTASH_TOKEN = 'test-only-token';
  t.mock.method(console, 'warn', () => {});
  globalThis.fetch.mock.mockImplementation(async (url) => {
    assert.notEqual(url, process.env.N8N_WEBHOOK_TEST_URL);
    return new Response('', { status: 401 });
  });
  const response = await invoke({ mode: 'log', sessionId: 'pending-job', messages: [{ role: 'user', content: 'Missed calls' }] });
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.logSaved, false);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('the n8n workflow acknowledges after storage and ignores old or duplicate transcript versions', async () => {
  const workflow = JSON.parse(await readFile(new URL('../docs/n8n-chat-history-workflow.json', import.meta.url), 'utf8'));
  assert.equal(workflow.nodes.find((node) => node.name === 'Webhook').parameters.responseMode, 'lastNode');
  const incoming = { 'Session ID': 'n8n-version-test', 'Conversation ID': 'n8n-version-test:/free-audit', Version: 4, Chat: 'full conversation', 'Contact Detials': '', 'Main Concern': '' };
  const code = workflow.nodes.find((node) => node.name === 'Keep newest chat').parameters.jsCode;
  const executeGate = (existing) => runInNewContext(`(function () { ${code} })()`, {
    $: () => ({ first: () => ({ json: { ...incoming } }) }),
    $input: { first: () => ({ json: existing }) },
  });
  assert.equal(executeGate({})[0].json.Version, 4);
  assert.equal(executeGate({ ...incoming, Version: 5 }).length, 0);
  assert.equal(executeGate({ ...incoming, Version: 4 }).length, 0);
  assert.equal(executeGate({ ...incoming, 'Conversation ID': 'n8n-version-test:/free-audit-ads', Version: 5 }).length, 1);
  const merged = executeGate({ ...incoming, Version: 3, 'Contact Detials': 'Name: Dana', 'Main Concern': 'Missed calls', 'Lead Captured': 'Yes' })[0].json;
  assert.equal(merged.Chat, 'full conversation');
  assert.equal(merged['Contact Detials'], 'Name: Dana');
  assert.equal(merged['Main Concern'], 'Missed calls');
  assert.equal(merged['Lead Captured'], 'Yes');
});

test('the audit fallback uses extracted names and typed contact details and waits for n8n', async (t) => {
  enableLogging();
  const tasks = captureBackground(t);
  let payload;
  let extractions = 0;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    if (url === process.env.N8N_WEBHOOK_TEST_URL) {
      payload = body;
      return Response.json({ ok: true });
    }
    if (body.response_format) {
      extractions++;
      return Response.json({ choices: [{ message: { content: JSON.stringify({ name: 'Dana', businessName: 'Audit Test Cleaning' }) } }] });
    }
    return Response.json({ choices: [{ message: { content: 'Thank you.' } }] });
  });
  const response = await invoke({ messages: [
    ...nameConversation,
    { role: 'assistant', content: "What's your cleaning business called?" },
    { role: 'user', content: 'Audit Test Cleaning, dana@example.com, (202) 234-5678' },
  ] });
  await Promise.all(tasks);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.booking.name, 'Dana');
  assert.equal(response.body.booking.phone, '+12022345678');
  assert.equal(payload.event, 'audit_request');
  assert.equal(payload.source, 'invo_chat');
  assert.equal(response.body.requestSent, true);
  assert.equal(payload.transcript.at(-1).content, response.body.reply);
  assert.equal(tasks.length, 1, 'Completed requests also survive a browser disconnect');
  assert.equal(payload.leadCaptured, true);
  assert.equal(extractions, 1, 'The fallback and logger share one extraction');
});

test('a webhook failure does not break the reply or reject background work', async (t) => {
  enableLogging();
  const tasks = captureBackground(t);
  t.mock.method(console, 'warn', () => {});
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    if (url === process.env.N8N_WEBHOOK_TEST_URL) throw new Error('Webhook unavailable');
    const body = JSON.parse(options.body);
    return Response.json({ choices: [{ message: { content: body.response_format ? '{}' : "What's your name?" } }] });
  });
  const response = await invoke({ messages: [{ role: 'user', content: "I'd like a free audit" }] });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.reply, "What's your name?");
  await Promise.all(tasks);
  assert.equal(response.body.logSaved, false);
  assert.equal(console.warn.mock.callCount(), 2);
});

const formLead = {
  name: 'Dana', businessName: 'Bright Home Cleaning', email: 'dana@example.com',
  phone: '(202) 234-5678', description: 'Help with quote follow ups',
};
const formDetails = {
  ...formLead, 'appointment datetime': '2099-11-15T14:30', appointmentTimeZone: 'America/New_York',
};
let formRequest = 0;
const invokeForm = (body, method = 'POST') => invoke(body, method, auditHandler, `audit-test-${++formRequest}`);

function webhookAcknowledgement(payload) {
  if (payload.source !== 'form_data') return { ok: true };
  const estimates = payload.estimates;
  return {
    success: true,
    submission_id: payload.submissionId,
    audit_complete: payload.event === 'quick_audit_completed',
    audit: estimates ? {
      missed_calls_month: estimates.missedCallsMonth,
      missed_call_value: estimates.missedCallValue,
      old_quotes_number: estimates.oldQuotesNumber,
      revival_value: estimates.revivalValue,
      guarantee_status: estimates.guaranteeStatus,
    } : null,
  };
}

test('the form endpoint handles GET without configuration', async () => {
  const response = await invokeForm(undefined, 'GET');
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('form data uses the shared webhook without chat data or a model request', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  let payload;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    assert.equal(url, process.env.N8N_WEBHOOK_TEST_URL);
    payload = JSON.parse(options.body);
    return Response.json(webhookAcknowledgement(payload));
  });
  const response = await invokeForm({
    ...formDetails, name: ' Dana ', submissionId: 'form-request-12345678', sessionId: 'shared-browser-session', pagePath: '/free-audit-ads',
    source: 'invo_chat', transcript: [{ role: 'user', content: 'Must not be forwarded' }], messages: ['private chat'],
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { success: true, submissionId: 'form-request-12345678' });
  assert.equal(payload.source, 'form_data', 'The server must assign the source');
  assert.equal(payload.event, 'audit_request');
  assert.equal(payload.pagePath, '/free-audit-ads');
  assert.deepEqual(payload.lead, { ...formLead, phone: '+12022345678' });
  assert.equal(payload['appointment datetime'], '2099-11-15T14:30');
  assert.equal('appointmentDate' in payload, false);
  assert.equal('appointmentTime' in payload, false);
  assert.equal(payload.appointmentTimeZone, 'America/New_York');
  assert.equal(payload.leadCaptured, true);
  assert.ok(!Number.isNaN(Date.parse(payload.timestamp)));
  assert.equal('transcript' in payload, false);
  assert.equal('messages' in payload, false);
  assert.equal(payload.sessionId, 'shared-browser-session');
  assert.equal('askedToBookDirectly' in payload, false);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('invalid form fields are rejected before any webhook call', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  for (const body of [null, [], {}, { ...formDetails, name: ' ' }, { ...formDetails, businessName: '' },
    { ...formDetails, email: 'not-an-email' }, { ...formDetails, phone: '+44 20 7946 0958' },
    { ...formDetails, phone: '555-555-5555' }, { ...formDetails, description: 'a'.repeat(1001) },
    { ...formDetails, businessName: { unexpected: true } }]) {
    assert.equal((await invokeForm(body)).statusCode, 400);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('missing, invalid and past appointment values never reach the webhook', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  for (const change of [
    { 'appointment datetime': undefined }, { 'appointment datetime': '' },
    { 'appointment datetime': '2000-01-01T14:30' }, { 'appointment datetime': '2099-02-30T14:30' }, { 'appointment datetime': '2100-02-29T14:30' },
    { 'appointment datetime': '11/15/2099 14:30' }, { 'appointment datetime': { invalid: true } },
    { 'appointment datetime': '2099-11-15T24:00' }, { 'appointment datetime': '2099-11-15T09:61' }, { 'appointment datetime': '2099-11-15T9:30' },
    { 'appointment datetime': '2099-11-15T14:30:00Z' }, { 'appointment datetime': 1430 },
    { 'appointment datetime': '2099-11-15' }, { 'appointment datetime': '14:30' },
    { appointmentTimeZone: 'Not/AZone' }, { appointmentTimeZone: [] }, { appointmentTimeZone: 'a'.repeat(101) },
    { appointmentTimeZone: 'Asia/Karachi' }, { appointmentTimeZone: 'UTC' }, { appointmentTimeZone: '' },
  ]) {
    const response = await invokeForm({ ...formDetails, ...change });
    assert.equal(response.statusCode, 400, JSON.stringify(change));
    assert.match(response.body.error, /future appointment/);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('appointment requests default to US Eastern Time when the zone is omitted', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  let payload;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    payload = JSON.parse(options.body);
    return Response.json(webhookAcknowledgement(payload));
  });
  const { appointmentTimeZone, ...request } = formDetails;
  assert.equal((await invokeForm(request)).statusCode, 200);
  assert.equal(payload.appointmentTimeZone, 'America/New_York');
  assert.equal(payload['appointment datetime'], formDetails['appointment datetime']);
});

test('appointment validation uses the selected US time zone across local dates', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2030-06-16T04:30:00Z') });
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  const payloads = [];
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return Response.json(webhookAcknowledgement(payloads.at(-1)));
  });
  // It is June 15 in Los Angeles and Hawaii, and June 16 in New York.
  const appointment = { ...formDetails, 'appointment datetime': '2030-06-15T22:00' };
  assert.equal((await invokeForm({ ...appointment, appointmentTimeZone: 'America/Los_Angeles' })).statusCode, 200);
  assert.equal((await invokeForm({ ...appointment, appointmentTimeZone: 'America/New_York' })).statusCode, 400);
  assert.equal((await invokeForm({ ...appointment, 'appointment datetime': '2030-06-15T18:00', appointmentTimeZone: 'Pacific/Honolulu' })).statusCode, 400);
  assert.equal((await invokeForm({ ...appointment, 'appointment datetime': '2030-06-15T19:00', appointmentTimeZone: 'Pacific/Honolulu' })).statusCode, 200);
  assert.equal(payloads.length, 2);
  assert.equal(payloads[0]['appointment datetime'], '2030-06-15T22:00');
  assert.equal(payloads[0].appointmentTimeZone, 'America/Los_Angeles');
});

test('missing webhook configuration does not acknowledge a form submission', async () => {
  const response = await invokeForm(formDetails);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.success, undefined);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('form success waits until n8n accepts the request', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  const webhook = Promise.withResolvers();
  let response;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    await webhook.promise;
    return Response.json(webhookAcknowledgement(JSON.parse(options.body)));
  });
  const pending = invokeForm(formDetails).then((value) => { response = value; });
  try {
    await nextTurn();
    assert.equal(globalThis.fetch.mock.callCount(), 1);
    assert.equal(response, undefined);
  } finally {
    webhook.resolve();
    await pending;
  }
  assert.equal(response.body.success, true);
});

test('webhook rejection and network timeouts return retryable form errors', async (t) => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  t.mock.method(console, 'warn', () => {});
  for (const result of ['http', 'network', 'timeout']) {
    globalThis.fetch.mock.mockImplementation(async () => {
      if (result === 'http') return new Response('private webhook diagnostics', { status: 500 });
      throw result === 'timeout' ? new DOMException('Timeout', 'TimeoutError') : new Error('Network failed');
    });
    const response = await invokeForm(formDetails);
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.success, undefined);
    assert.equal(response.body.error, "We couldn't send your request. Please try again.");
  }
});

test('production routing sends chat and form sources to the same production URL', async (t) => {
  enableLogging();
  process.env.VERCEL_ENV = 'production';
  process.env.N8N_WEBHOOK_URL = 'https://production.test/webhook';
  const tasks = captureBackground(t);
  const payloads = [];
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    assert.notEqual(url, process.env.N8N_WEBHOOK_TEST_URL);
    if (url === process.env.N8N_WEBHOOK_URL) {
      payloads.push(body);
      return Response.json(webhookAcknowledgement(body));
    }
    return Response.json({ choices: [{ message: { content: body.response_format ? '{}' : "What's your name?" } }] });
  });
  assert.equal((await invokeForm(formDetails)).body.success, true);
  await invoke({ messages: [{ role: 'user', content: "I'd like an audit" }] });
  await Promise.all(tasks);
  assert.deepEqual(payloads.map((payload) => payload.source).sort(), ['form_data', 'invo_chat', 'invo_chat']);
});

test('the production override is shared by form submissions', async () => {
  process.env.N8N_USE_PRODUCTION = 'true';
  process.env.N8N_WEBHOOK_URL = 'https://production.test/webhook';
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    assert.equal(url, process.env.N8N_WEBHOOK_URL);
    return Response.json(webhookAcknowledgement(JSON.parse(options.body)));
  });
  assert.equal((await invokeForm(formDetails)).body.success, true);
});

test('excessive form submissions are rate limited before contacting n8n', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  globalThis.fetch.mock.mockImplementation(async (_url, options) => Response.json(webhookAcknowledgement(JSON.parse(options.body))));
  for (let index = 0; index < 10; index++) {
    assert.equal((await invoke(formDetails, 'POST', auditHandler, 'form-rate-limit-test')).statusCode, 200);
  }
  const response = await invoke(formDetails, 'POST', auditHandler, 'form-rate-limit-test');
  assert.equal(response.statusCode, 429);
  assert.equal(globalThis.fetch.mock.callCount(), 10);
});

test('a completed chat request reports failed webhook delivery and retains details for the form', async (t) => {
  enableLogging();
  t.mock.method(console, 'warn', () => {});
  globalThis.fetch.mock.mockImplementation(async (url) => {
    if (url === process.env.N8N_WEBHOOK_TEST_URL) return new Response('', { status: 503 });
    return Response.json({ choices: [{ message: { tool_calls: [{ function: {
      name: 'submit_booking_details', arguments: JSON.stringify({ ...formDetails, businessName: 'Audit Test Cleaning' }),
    } }] } }] });
  });
  const response = await invoke({ messages: [
    ...nameConversation,
    { role: 'user', content: 'Audit Test Cleaning, dana@example.com, (202) 234-5678' },
  ] });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.requestSent, false);
  assert.equal(response.body.booking.email, formDetails.email);
  assert.match(response.body.reply, /couldn't send.*form/);
});

test('a quick chat request submits contact details without a calendar link', async () => {
  enableLogging();
  let payload;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    if (url === process.env.N8N_WEBHOOK_TEST_URL) {
      payload = body;
      return Response.json({ ok: true });
    }
    if (body.response_format) return Response.json({ choices: [{ message: { content: '{}' } }] });
    assert.ok(body.tools.some((tool) => tool.function.name === 'submit_audit_contact'));
    return Response.json({ choices: [{ message: { tool_calls: [{ function: {
      name: 'submit_audit_contact', arguments: JSON.stringify({ email: formDetails.email, phone: formDetails.phone }),
    } }] } }] });
  });
  const response = await invoke({ messages: [
    { role: 'user', content: 'Book me now, dana@example.com, (202) 234-5678' },
  ] });
  assert.equal(response.body.requestSent, true);
  assert.equal(response.body.directLink, true);
  assert.deepEqual(response.body.contact, { email: formDetails.email, phone: '+12022345678' });
  assert.equal(payload.source, 'invo_chat');
  assert.equal(payload.event, 'audit_request');
  assert.equal(payload.askedToBookDirectly, true);
  assert.doesNotMatch(response.body.reply, /calendar|choose a time|https?:/i);
});

const quickAudit = {
  mode: 'quick_audit', pagePath: '/free-audit', submissionId: 'quick-audit-test-123456', sessionId: 'quick-session',
  answers: { businessName: 'Bright Home Cleaning', missedCalls: '6–15', oldQuotes: '50–200', typicalClean: '$120–$180' },
  email: 'dana@example.com', phone: '(202) 234-5678', website: 'https://brighthome.example', companySize: '2–4 cleaners',
};

test('chat and both forms forward the same visitor ID, including retries', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  const payloads = [];
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return Response.json(webhookAcknowledgement(payloads.at(-1)));
  });
  const sessionId = 'one-browser-123456';
  const chat = { mode: 'log', sessionId, messages: [{ role: 'user', content: 'Help with missed calls' }] };
  assert.equal((await invoke(chat)).statusCode, 200);
  for (const details of [formDetails, quickAudit]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      assert.equal((await invokeForm({ ...details, sessionId })).statusCode, 200);
    }
  }
  assert.equal(payloads.length, 5);
  assert.ok(payloads.every((payload) => payload.sessionId === sessionId));
});

test('every webhook path supplies a nonempty fallback ID for missing or invalid IDs', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  const payloads = [];
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return Response.json(webhookAcknowledgement(payloads.at(-1)));
  });
  for (const sessionId of [undefined, null, '', ' ', {}, 'x'.repeat(65)]) {
    assert.equal((await invoke({ mode: 'log', sessionId, messages: [{ role: 'user', content: 'Help' }] })).statusCode, 200);
    assert.equal((await invokeForm({ ...formDetails, sessionId })).statusCode, 200);
    assert.equal((await invokeForm({ ...quickAudit, sessionId })).statusCode, 200);
  }
  assert.equal(payloads.length, 18);
  assert.ok(payloads.every((payload) => /^[a-f0-9-]{36}$/.test(payload.sessionId)));
});

test('shared browser IDs do not deduplicate identical messages from different pages', () => {
  const log = { sessionId: 'one-browser', event: 'message', pagePath: '/free-audit', transcript: [{ role: 'user', content: 'Hi' }] };
  assert.equal(chatEventId(log), chatEventId({ ...log }));
  assert.notEqual(chatEventId(log), chatEventId({ ...log, pagePath: '/free-audit-ads' }));
});

for (const pagePath of ['/free-audit', '/free-audit-ads']) {
  test(`${pagePath} submits one quick audit with server estimates and email-agent data`, async () => {
    process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
    let payload;
    globalThis.fetch.mock.mockImplementation(async (_url, options) => {
      payload = JSON.parse(options.body);
      return Response.json(webhookAcknowledgement(payload));
    });
    const response = await invokeForm({ ...quickAudit, pagePath, estimates: { missedCallValue: 999999 },
      tracking: { utm_source: 'facebook', utm_campaign: 'audit', fbclid: 'click', untrusted: 'drop' } });
    assert.equal(response.statusCode, 200);
    assert.equal(payload.source, 'form_data');
    assert.equal(payload.event, 'quick_audit_completed');
    assert.equal(payload.pagePath, pagePath);
    assert.equal(payload.submissionId, quickAudit.submissionId);
    assert.equal(payload.sessionId, quickAudit.sessionId);
    assert.deepEqual(payload.tracking, { utm_source: 'facebook', utm_campaign: 'audit', fbclid: 'click' });
    assert.equal(payload.lead.phone, '+12022345678');
    assert.equal(payload.lead.companySize, '2–4 cleaners');
    assert.deepEqual(payload.estimates, { missedCallsMonth: 43, missedCallValue: 1300, oldQuotesNumber: 125, revivalValue: 1700, guaranteeStatus: 'close' });
    assert.deepEqual(response.body.results, payload.estimates);
    assert.equal(payload.auditEmail.data.subject_opportunity, 'old_quotes');
    assert.equal(payload.auditEmail.data.missed_call_value, 1300);
    assert.equal(payload.auditEmail.data.revival_value, 1700);
    assert.match(payload.auditEmail.systemPrompt, /Never recalculate/);
    assert.match(payload.auditEmail.data.booking_link, /free-audit\?book=1$/);
    assert.equal(payload.smsConsent.granted, true);
    assert.equal(globalThis.fetch.mock.callCount(), 1);
  });
}

test('the quick audit cannot unlock before its valid form is accepted by the webhook', async (t) => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  t.mock.method(console, 'warn', () => {});
  for (const changes of [{ email: '' }, { phone: '555-555-5555' }, { website: '' }, { website: 'javascript:alert(1)' },
    { companySize: '' }, { answers: { businessName: 'Incomplete' } }, { pagePath: '/contact' }]) {
    const response = await invokeForm({ ...quickAudit, ...changes });
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.results, undefined);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0);
  let accept;
  globalThis.fetch.mock.mockImplementation(() => new Promise((resolve) => { accept = resolve; }));
  let completed = false;
  const pending = invokeForm(quickAudit).then((response) => { completed = true; return response; });
  await nextTurn();
  assert.equal(completed, false);
  accept(Response.json({}, { status: 500 }));
  const response = await pending;
  assert.equal(response.statusCode, 502);
  assert.equal(response.body.results, undefined);
});

test('no website and unknown old quotes are carried through without invented estimates', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  let payload;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    payload = JSON.parse(options.body);
    return Response.json(webhookAcknowledgement(payload));
  });
  const response = await invokeForm({ ...quickAudit, noWebsite: true, website: '', answers: { ...quickAudit.answers, oldQuotes: 'Not sure' } });
  assert.equal(response.statusCode, 200);
  assert.equal(payload.lead.website, 'none');
  assert.equal(payload.auditEmail.data.website, 'none');
  assert.equal(payload.auditEmail.data.revival_value, null);
  assert.equal(payload.auditEmail.data.guarantee_status, 'none');
  assert.equal(payload.auditEmail.data.subject_opportunity, 'missed_calls');
  assert.equal(response.body.results.oldQuotesNumber, null);
  assert.equal(response.body.results.revivalValue, null);
  assert.equal(response.body.results.guaranteeStatus, 'none');
});

test('a 2xx without a matching saved-submission acknowledgement cannot confirm either form', async (t) => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  t.mock.method(console, 'warn', () => {});
  const invalidResponses = [
    () => new Response(''),
    () => new Response('Workflow was started'),
    () => Response.json({ ok: true }),
    () => Response.json([]),
    () => Response.json(null),
    (payload) => Response.json({ ...webhookAcknowledgement(payload), success: false, error: 'private n8n diagnostic' }),
    (payload) => Response.json({ ...webhookAcknowledgement(payload), submission_id: undefined }),
    (payload) => Response.json({ ...webhookAcknowledgement(payload), submission_id: 'another-submission-id' }),
  ];
  for (const details of [formDetails, quickAudit]) {
    for (const invalidResponse of invalidResponses) {
      globalThis.fetch.mock.mockImplementation(async (_url, options) => invalidResponse(JSON.parse(options.body)));
      const response = await invokeForm(details);
      assert.equal(response.statusCode, 502);
      assert.equal(response.body.success, undefined);
      assert.equal(response.body.results, undefined);
      assert.doesNotMatch(response.body.error, /private n8n diagnostic/);
    }
  }
});

test('incomplete or divergent n8n audit results stay locked instead of exposing local estimates', async (t) => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  t.mock.method(console, 'warn', () => {});
  const changes = [
    (ack) => ({ ...ack, audit_complete: false }),
    (ack) => ({ ...ack, audit_complete: 'true' }),
    (ack) => ({ ...ack, audit: null }),
    (ack) => ({ ...ack, audit: [] }),
    ...[
      ['missed_calls_month', 44], ['missed_call_value', 999999],
      ['old_quotes_number', 350], ['revival_value', 9000],
      ['guarantee_status', 'qualifies'], ['missed_call_value', '1300'],
      ['revival_value', undefined],
    ].map(([key, value]) => (ack) => ({ ...ack, audit: { ...ack.audit, [key]: value } })),
  ];
  for (const change of changes) {
    globalThis.fetch.mock.mockImplementation(async (_url, options) => Response.json(change(webhookAcknowledgement(JSON.parse(options.body)))));
    const response = await invokeForm(quickAudit);
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.success, undefined);
    assert.equal(response.body.results, undefined);
  }
});

test('webhook failures expose safe diagnostic codes and distinguish a missing test hook from an invalid acknowledgement', async (t) => {
  const privateDiagnostic = 'https://secret-host.test/private-token private-contact@example.com +12022345678 raw-provider-secret';
  process.env.N8N_WEBHOOK_TEST_URL = 'https://secret-host.test/private-token';
  t.mock.method(console, 'warn', () => {});
  const submissionId = 'diagnostic-audit-12345678';
  const cases = [
    { code: 'WEBHOOK_NOT_REGISTERED', status: 404, failure: 'http_error', respond: () => new Response(privateDiagnostic, { status: 404 }) },
    { code: 'WEBHOOK_HTTP_ERROR', status: 500, failure: 'http_error', respond: () => new Response(privateDiagnostic, { status: 500 }) },
    { code: 'WEBHOOK_TIMEOUT', status: null, failure: 'timeout', respond: () => { throw new DOMException(privateDiagnostic, 'TimeoutError'); } },
    { code: 'WEBHOOK_TIMEOUT', status: null, failure: 'timeout', respond: () => { throw new DOMException(privateDiagnostic, 'AbortError'); } },
    { code: 'WEBHOOK_NETWORK_ERROR', status: null, failure: 'network_error', respond: () => { throw new Error(privateDiagnostic); } },
    { code: 'WEBHOOK_INVALID_RESPONSE', status: 200, failure: 'empty_response', respond: () => new Response(' \n') },
    { code: 'WEBHOOK_INVALID_RESPONSE', status: 200, failure: 'invalid_json', respond: () => new Response(privateDiagnostic) },
    { code: 'WEBHOOK_ACK_MISMATCH', status: 200, failure: null,
      respond: (payload) => Response.json({ ...webhookAcknowledgement(payload), success: false, error: privateDiagnostic }) },
    { code: 'WEBHOOK_ACK_MISMATCH', status: 200, failure: null,
      respond: (payload) => Response.json({ ...webhookAcknowledgement(payload), submission_id: 'other-submission-id', error: privateDiagnostic }) },
    { code: 'WEBHOOK_AUDIT_MISMATCH', status: 200, failure: null, quick: true,
      respond: (payload) => { const ack = webhookAcknowledgement(payload); return Response.json({ ...ack, audit: { ...ack.audit, missed_call_value: 999999 }, error: privateDiagnostic }); } },
  ];
  for (const scenario of cases) {
    globalThis.fetch.mock.mockImplementation(async (_url, options) => scenario.respond(JSON.parse(options.body)));
    const response = await invokeForm({ ...(scenario.quick ? quickAudit : formDetails), submissionId });
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.code, scenario.code);
    assert.equal(response.body.success, undefined);
    assert.equal(response.body.results, undefined);
    const log = console.warn.mock.calls.at(-1).arguments;
    assert.equal(log[0], '[audit] n8n submission failed');
    assert.equal(log[1].code, scenario.code);
    assert.equal(log[1].upstreamStatus, scenario.status);
    assert.equal(log[1].failure, scenario.failure);
    assert.equal(log[1].target, 'test');
    assert.equal(log[1].event, scenario.quick ? 'quick_audit_completed' : 'audit_request');
    assert.equal(log[1].submissionId, submissionId);
    for (const value of [JSON.stringify(response.body), JSON.stringify(log)]) {
      assert.doesNotMatch(value, /secret-host|private-token|private-contact|raw-provider-secret|\+12022345678|dana@example\.com|Bright Home Cleaning/);
    }
  }
  assert.equal(console.warn.mock.callCount(), cases.length);
});

test('quick audit success waits for the response body and returns only the confirmed public estimates', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  const body = Promise.withResolvers();
  let completed = false;
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    const ack = webhookAcknowledgement(JSON.parse(options.body));
    return { ok: true, status: 200, text: async () => { await body.promise; return JSON.stringify({ ...ack, internalDiagnostic: 'private', audit: { ...ack.audit, internalEmail: 'private@example.com' } }); } };
  });
  const pending = invokeForm(quickAudit).then((response) => { completed = true; return response; });
  await nextTurn();
  assert.equal(completed, false);
  body.resolve();
  const response = await pending;
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true, submissionId: quickAudit.submissionId,
    results: { missedCallsMonth: 43, missedCallValue: 1300, oldQuotesNumber: 125, revivalValue: 1700, guaranteeStatus: 'close' },
  });
});

test('pricing gives the complete founding offer specified for the audit page', async () => {
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'What does it cost?' }] });
  assert.equal(response.statusCode, 200);
  assert.match(response.body.reply, /\$1,500/);
  assert.match(response.body.reply, /\$345 a month/);
  assert.match(response.body.reply, /audit is free/);
  assert.match(response.body.reply, /locked for life/);
  assert.match(response.body.reply, /Three of five founding spots/);
  assert.match(response.body.reply, /guaranteed to pay for itself in 90 days/);
  assert.match(response.body.reply, /Want me to book it\?/);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('the first four quick replies have complete predefined answers without needing a model key', async () => {
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  for (const [label, reply] of Object.entries(AUDIT_QUICK_REPLIES)) {
    const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: label }] });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.reply, reply);
    assert.equal(response.body.requestSent, undefined);
    assert.ok(reply.includes('\n\n'));
    assert.equal(predefinedAuditReply(` ${label.toUpperCase()}. `), reply);
  }
  assert.equal(predefinedAuditReply('My quotes go quiet. How much does it cost?'), undefined);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('predefined quick replies still log both visitor and complete assistant messages', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  const logs = [];
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    assert.equal(url, process.env.N8N_WEBHOOK_TEST_URL);
    logs.push(JSON.parse(options.body));
    return Response.json({success: true});
  });
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: "I'm missing calls" }] });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.logSaved, true);
  assert.equal(logs.length, 2);
  assert.equal(logs[1].transcript.at(-1).content, AUDIT_QUICK_REPLIES["I'm missing calls"]);
});

test('long assistant explanations survive subsequent conversation requests without truncation', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  const explanation = 'A detailed owner-approved follow-up explanation. '.repeat(50);
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    assert.equal(JSON.parse(options.body).messages[2].content, explanation.trim());
    return Response.json({choices: [{message: {content: 'We can check your current tools on the call.'}}]});
  });
  const response = await invoke({experience: 'guided-audit', messages: [
    {role: 'user', content: 'Explain the services.'}, {role: 'assistant', content: explanation},
    {role: 'user', content: 'Can this work with my current tools?'},
  ]});
  assert.equal(response.statusCode, 200);
});

test('guided chat uses the updated AI prompt and cannot submit the legacy booking tools', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    const payload = JSON.parse(options.body);
    assert.equal(payload.tools, undefined);
    assert.equal(payload.model, 'gpt-6-luna');
    assert.equal(payload.reasoning_effort, 'none');
    assert.equal(payload.max_completion_tokens, 1200);
    assert.equal(payload.max_tokens, undefined);
    assert.equal(payload.temperature, undefined);
    assert.match(payload.messages[0].content, /AI assistant/);
    assert.match(payload.messages[0].content, /15-minute/);
    assert.match(payload.messages[0].content, /200 past enquiries/);
    assert.match(payload.messages[0].content, /no fixed word or sentence limit/);
    assert.doesNotMatch(payload.messages[0].content, /never more than 35 words|up to 60 words|1–2 short sentences/);
    assert.doesNotMatch(payload.messages[0].content, /30 minute|Never give prices/);
    return Response.json({ choices: [{ message: { content: 'Use Book my free audit to start your quick audit.' } }] });
  });
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'How does the audit work?' }] });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.requestSent, undefined);
});

test('chat preserves the full answer and paragraph formatting instead of dropping details after two sentences', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: 'Quote Chaser follows up new quotes. Quote Revival reconnects with old enquiries.\n\nYou approve messages before they go live. The audit checks which service fits your business.',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'Explain how the quote services work together.' }] });
  assert.equal(response.body.reply, 'Quote Chaser follows up new quotes. Quote Revival reconnects with old enquiries.\n\nYou approve messages before they go live. The audit checks which service fits your business.');
});

test('a long guarantee answer keeps its complete conditions and its additional explanation', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  const terms = 'If you have at least 200 past enquiries or quotes, and cleans booked in the first 90 days do not exceed everything you paid us, you pay no monthly fee until they do.';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: terms + ' The audit checks eligibility.',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'What does the guarantee cover?' }] });
  assert.equal(response.body.reply, terms + ' The audit checks eligibility.');
  assert.match(response.body.reply, /200 past enquiries/);
  assert.match(response.body.reply, /90 days/);
  assert.match(response.body.reply, /until they do\./);
});

test('an explicit older provider model override retains its compatible request parameters', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.KOBOILLM_MODEL = 'gpt-4.1-mini';
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, 'gpt-4.1-mini');
    assert.equal(payload.max_tokens, 1200);
    assert.equal(payload.temperature, 0.3);
    assert.equal(payload.reasoning_effort, undefined);
    assert.equal(payload.max_completion_tokens, undefined);
    return Response.json({ choices: [{ message: { content: 'The audit is free and takes 15 minutes.' } }] });
  });
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'How does the audit work?' }] });
  assert.equal(response.statusCode, 200);
});

test('a combined pricing and guarantee question reaches the agent instead of losing the requested guarantee terms', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.N8N_LOG_EVERY_MESSAGE = 'false';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: 'The guarantee needs 200 past enquiries or quotes. If booked cleans do not exceed what you paid in 90 days, there is no monthly fee until they do.',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'How much does it cost and what is the guarantee?' }] });
  assert.equal(response.statusCode, 200);
  assert.match(response.body.reply, /200 past enquiries/);
  assert.match(response.body.reply, /90 days/);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('the compiled server entry point resolves its imports in plain Node', async (t) => {
  const prefix = path.join(tmpdir(), 'inventtomorrow-chat-runtime-');
  const directory = await mkdtemp(prefix);
  assert.ok(directory.startsWith(prefix));
  let linked = false;
  t.after(async () => {
    if (linked) await unlink(path.join(directory, 'node_modules'));
    await rm(directory, { recursive: true, force: true });
  });
  await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  linked = true;
  await mkdir(path.join(directory, 'dist'));
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ type: 'module' }));
  const config = path.join(directory, 'tsconfig.json');
  await writeFile(config, JSON.stringify({
    extends: path.join(root, 'api', 'tsconfig.json'),
    compilerOptions: {
      noEmit: false,
      rootDir: root,
      outDir: path.join(directory, 'dist'),
    },
    files: [path.join(root, 'api', 'chat.ts'), path.join(root, 'api', 'audit.ts')],
    include: [],
  }));
  await promisify(execFile)(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '--project', config]);
  const { default: compiledHandler } = await import(pathToFileURL(path.join(directory, 'dist', 'api', 'chat.js')).href);
  const response = await invoke(undefined, 'GET', compiledHandler);
  assert.equal(response.statusCode, 405);
  const { default: compiledAudit } = await import(pathToFileURL(path.join(directory, 'dist', 'api', 'audit.js')).href);
  assert.equal((await invoke(undefined, 'GET', compiledAudit)).statusCode, 405);
});

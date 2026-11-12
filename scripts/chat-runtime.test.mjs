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
  const incoming = { 'Session ID': 'n8n-version-test', Version: 4, Chat: 'full conversation', 'Contact Detials': '', 'Main Concern': '' };
  const code = workflow.nodes.find((node) => node.name === 'Keep newest chat').parameters.jsCode;
  const executeGate = (existing) => runInNewContext(`(function () { ${code} })()`, {
    $: () => ({ first: () => ({ json: { ...incoming } }) }),
    $input: { first: () => ({ json: existing }) },
  });
  assert.equal(executeGate({})[0].json.Version, 4);
  assert.equal(executeGate({ 'Session ID': incoming['Session ID'], Version: 5 }).length, 0);
  assert.equal(executeGate({ 'Session ID': incoming['Session ID'], Version: 4 }).length, 0);
  const merged = executeGate({ 'Session ID': incoming['Session ID'], Version: 3, 'Contact Detials': 'Name: Dana', 'Main Concern': 'Missed calls', 'Lead Captured': 'Yes' })[0].json;
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
    return Response.json({ ok: true });
  });
  const response = await invokeForm({
    ...formDetails, name: ' Dana ', submissionId: 'form-request-12345678', pagePath: '/free-audit-ads',
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
  assert.equal('sessionId' in payload, false);
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
    return Response.json({ ok: true });
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
    return Response.json({ ok: true });
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
  globalThis.fetch.mock.mockImplementation(async () => {
    await webhook.promise;
    return Response.json({ ok: true });
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
      return Response.json({ ok: true });
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
  globalThis.fetch.mock.mockImplementation(async (url) => {
    assert.equal(url, process.env.N8N_WEBHOOK_URL);
    return Response.json({ ok: true });
  });
  assert.equal((await invokeForm(formDetails)).body.success, true);
});

test('excessive form submissions are rate limited before contacting n8n', async () => {
  process.env.N8N_WEBHOOK_TEST_URL = 'https://logging.test/webhook';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ ok: true }));
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

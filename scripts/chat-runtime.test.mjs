import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
// Deliberately use plain Node rather than tsx: production must resolve this entry point too.
import handler from '../api/chat.ts';
import auditHandler from '../api/audit.ts';
import { AUDIT_PRICING_REPLY, AUDIT_QUESTIONS, AUDIT_QUICK_REPLIES, predefinedAuditReply } from '../src/utils/freeAudit.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const envKeys = ['KOBOILLM_API_KEY', 'KOBOILLM_BASE_URL', 'KOBOILLM_MODEL', 'GMAIL_AUDIT_REPORTS_ENABLED', 'GMAIL_FORM_NOTIFICATIONS_ENABLED', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_SENDER_EMAIL', 'GMAIL_NOTIFICATION_EMAIL', 'GOOGLE_SHEETS_ENABLED', 'SLACK_LEAD_ALERTS_ENABLED'];

beforeEach((t) => {
  const saved = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  t.after(() => {
    for (const key of envKeys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });
  // No test may contact the provider or Google.
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
const invokeForm = (body, method = 'POST', ip) => invoke(body, method, auditHandler, ip);

const gmailSettings = {
  GMAIL_AUDIT_REPORTS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret',
  GMAIL_REFRESH_TOKEN: 'test-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com',
};
const contactForm = {
  name: 'Dana', businessName: 'Bright Home Cleaning', email: 'dana@example.com', phone: '(202) 234-5678',
  description: 'Follow up our quiet quotes.', 'appointment datetime': '2999-12-01T10:30', appointmentTimeZone: 'America/New_York',
  pagePath: '/contact', submissionId: 'gmail-contact-test-12345678', tracking: { utm_source: 'test' },
};

test('contact requests and case-study unlocks notify the server-configured mailbox before success', async () => {
  Object.assign(process.env, gmailSettings, { GMAIL_NOTIFICATION_EMAIL: 'team@example.com' });
  const sent = [];
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    if (url === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'mock-access', token_type: 'Bearer' });
    assert.equal(url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
    sent.push(Buffer.from(JSON.parse(options.body).raw, 'base64url').toString('utf8'));
    return Response.json({ id: 'accepted-notification' });
  });
  const contact = await invokeForm(contactForm);
  const unlock = await invokeForm({ ...contactForm, mode: 'case_study_unlock', caseStudySlug: 'old-leads-revenue-recovery', submissionId: 'gmail-unlock-test-12345678' });
  assert.equal(contact.statusCode, 200);
  assert.equal(contact.body.success, true);
  assert.equal(unlock.body.success, true);
  assert.equal(sent.length, 2);
  for (const mime of sent) {
    assert.match(mime, /To: team@example.com\r\n/);
    assert.match(mime, /Reply-To: dana@example.com\r\n/);
    assert.doesNotMatch(mime, /^To: dana@example.com\r\n/m);
    const text = Buffer.from(mime.split('\r\n\r\n')[1], 'base64').toString('utf8');
    assert.match(text, /Bright Home Cleaning/);
    assert.match(text, /utm_source: test/);
  }
  assert.match(Buffer.from(sent[0].split('\r\n\r\n')[1], 'base64').toString('utf8'), /America\/New_York/);
});

test('forms cannot acknowledge success when Gmail is disabled or rejects sending', async () => {
  const disabled = await invokeForm(contactForm);
  assert.equal(disabled.statusCode, 503);
  assert.equal(disabled.body.success, undefined);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
  Object.assign(process.env, gmailSettings);
  globalThis.fetch.mock.mockImplementation(async (url) => url.includes('oauth2')
    ? Response.json({ access_token: 'mock-access', token_type: 'Bearer' }) : new Response('PRIVATE Google error', { status: 429 }));
  const failed = await invokeForm({ ...contactForm, submissionId: 'failed-contact-test-123456' });
  assert.equal(failed.statusCode, 502);
  assert.equal(failed.body.success, undefined);
  assert.doesNotMatch(JSON.stringify(failed), /PRIVATE|test-refresh|test-secret/);
});

test('invalid contact data, appointment values and unlock slugs are rejected before sending', async () => {
  Object.assign(process.env, gmailSettings);
  for (const changes of [{ email: 'invalid' }, { phone: '+44 20 7946 0958' }, { name: '' },
    { 'appointment datetime': '2000-01-01T10:00' }, { appointmentTimeZone: 'not-a-time-zone' },
    { mode: 'case_study_unlock', caseStudySlug: '../bad' }]) {
    const response = await invokeForm({ ...contactForm, ...changes });
    assert.equal(response.statusCode, 400);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('the legacy quick audit emails server-calculated estimates directly to its submitted lead', async () => {
  Object.assign(process.env, gmailSettings);
  let mime = '';
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    if (url.includes('oauth2')) return Response.json({ access_token: 'mock-access', token_type: 'Bearer' });
    mime = Buffer.from(JSON.parse(options.body).raw, 'base64url').toString('utf8');
    return Response.json({ id: 'accepted-quick-audit' });
  });
  const response = await invokeForm({ ...contactForm, mode: 'quick_audit', pagePath: '/free-audit',
    answers: { businessName: 'Bright Home Cleaning', missedCalls: '6–15', oldQuotes: 'Not sure', typicalClean: 'Under $120' },
    website: 'brighthome.example', companySize: 'Just me', submissionId: 'gmail-quick-audit-12345678' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.reportEmailSent, true);
  assert.equal(response.body.results.missedCallsMonth, 43);
  assert.match(mime, /To: dana@example.com/);
});

test('chat contact handoffs require real typed details and a Gmail acceptance', async () => {
  Object.assign(process.env, gmailSettings, { KOBOILLM_API_KEY: 'test-provider' });
  const booking = { name: 'Dana', businessName: 'Bright Home Cleaning', email: 'dana@example.com', phone: '(202) 234-5678' };
  for (const accepted of [true, false]) {
    globalThis.fetch.mock.mockImplementation(async (url) => {
      if (url.endsWith('/chat/completions')) return Response.json({ choices: [{ message: { tool_calls: [{ function: { name: 'submit_booking_details', arguments: JSON.stringify(booking) } }] } }] });
      if (url.includes('oauth2')) return Response.json({ access_token: 'mock-access', token_type: 'Bearer' });
      return accepted ? Response.json({ id: 'chat-notification' }) : new Response('', { status: 500 });
    });
    const response = await invoke({ messages: [{ role: 'user', content: "I'm Dana from Bright Home Cleaning. My email is dana@example.com and phone is (202) 234-5678." }], sessionId: 'gmail-chat-' + accepted });
    assert.equal(response.body.requestSent, accepted);
    assert.match(response.body.reply, accepted ? /request is received/ : /couldn't send/);
    assert.equal(response.body.booking.phone, '+12022345678');
  }
});

test('old log-only requests complete without saving or contacting any external service', async () => {
  const response = await invoke({ mode: 'log', messages: [{ role: 'user', content: 'An old pending transcript.' }] });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.loggingDisabled, true);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

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

test('the form endpoint handles GET without configuration', async () => {
  const response = await invokeForm(undefined, 'GET');
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('pricing gives the complete founding offer specified for the audit page', async () => {
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'What does it cost?' }] });
  assert.equal(response.statusCode, 200);
  assert.match(response.body.reply, /\$1,272/);
  assert.match(response.body.reply, /\$345 a month/);
  assert.match(response.body.reply, /audit is free/);
  assert.match(response.body.reply, /locked for life/);
  assert.match(response.body.reply, /Two of five founding spots/);
  assert.match(response.body.reply, /guaranteed to pay for itself in 90 days/);
  assert.match(response.body.reply, /Want me to book it\?/);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('the first four quick replies have complete predefined answers without needing a model key', async () => {
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

test('long assistant explanations survive subsequent conversation requests without truncation', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
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
    // Concise and professional by default, with full detail reserved for prices and guarantee terms.
    assert.match(payload.messages[0].content, /Put the direct answer in the first sentence/);
    assert.match(payload.messages[0].content, /1–3 short sentences/);
    assert.match(payload.messages[0].content, /Professional, calm and courteous/);
    assert.match(payload.messages[0].content, /never cryptic/);
    assert.match(payload.messages[0].content, /always state the 200-enquiry condition/i);
    assert.doesNotMatch(payload.messages[0].content, /no fixed word or sentence limit/);
    assert.doesNotMatch(payload.messages[0].content, /never more than 35 words|up to 60 words|1–2 short sentences/);
    assert.doesNotMatch(payload.messages[0].content, /30 minute|Never give prices/);
    return Response.json({ choices: [{ message: { content: 'Use Book my free audit to start your quick audit.' } }] });
  });
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'How does the audit work?' }] });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.requestSent, undefined);
});

test('the prompt in docs/prompts/invo-system-prompt.txt is exactly what the chat sends', async () => {
  const { INVO_SYSTEM_PROMPT } = await import('../server/auditPrompts.ts');
  const { FOUNDING_SPOTS_LEFT } = await import('../src/utils/freeAudit.ts');
  const text = (await readFile(path.join(root, 'docs/prompts/invo-system-prompt.txt'), 'utf8')).split('\r\n').join('\n').trimEnd();
  assert.equal(INVO_SYSTEM_PROMPT, text, 'edit the TXT, then run its contents into server/auditPrompts.ts');
  assert.match(INVO_SYSTEM_PROMPT, new RegExp(String(FOUNDING_SPOTS_LEFT) + ' of 5 founding spots are left'));
});

test('chat preserves the full answer and paragraph formatting instead of dropping details after two sentences', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: 'Quote Chaser follows up new quotes. Quote Revival reconnects with old enquiries.\n\nYou approve messages before they go live. The audit checks which service fits your business.',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'Explain how the quote services work together.' }] });
  assert.equal(response.body.reply, 'Quote Chaser follows up new quotes. Quote Revival reconnects with old enquiries.\n\nYou approve messages before they go live. The audit checks which service fits your business.');
});

test('a long guarantee answer keeps its complete conditions and its additional explanation', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  const terms = 'If you have at least 200 past enquiries or quotes, and cleans booked in the first 90 days do not exceed everything you paid us, you pay no monthly fee until they do.';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: terms + ' The audit checks eligibility.',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'What does the guarantee cover if I only have 120 old quotes in total?' }] });
  assert.equal(response.body.reply, terms + ' The audit checks eligibility.');
  assert.match(response.body.reply, /200 past enquiries/);
  assert.match(response.body.reply, /90 days/);
  assert.match(response.body.reply, /until they do\./);
});

test('an explicit older provider model override retains its compatible request parameters', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  process.env.KOBOILLM_MODEL = 'gpt-4.1-mini';
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
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: 'The guarantee needs 200 past enquiries or quotes. If booked cleans do not exceed what you paid in 90 days, there is no monthly fee until they do.',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'How much does it cost and what is the guarantee?' }] });
  assert.equal(response.statusCode, 200);
  assert.match(response.body.reply, /200 past enquiries/);
  assert.match(response.body.reply, /90 days/);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('only questions about our price get the pricing reply; earnings and the visitor\'s own prices reach the agent', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: { content: 'Agent answer.' } }] }));
  for (const content of ['Is there a setup fee?', 'pricing', 'How much is it?', 'What do you charge per month?']) {
    const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content }] });
    assert.equal(response.body.reply, AUDIT_PRICING_REPLY, content);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0);
  for (const content of ['How much am I losing from missed calls?', 'How much is a missed call worth?', 'My cleans cost about $150, can you help?', 'How much could I make from old quotes?']) {
    const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content }] });
    assert.equal(response.body.reply, 'Agent answer.', content);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 4);
});

test('mid-audit, the agent knows which question is waiting and canned replies stop inviting a restart', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  const prompts = [];
  globalThis.fetch.mock.mockImplementation(async (_url, options) => {
    prompts.push(JSON.parse(options.body).messages[0].content);
    return Response.json({ choices: [{ message: { content: 'Any call you could not answer on a job counts.' } }] });
  });
  const ask = (state, content) => invoke({ experience: 'guided-audit', state: { lead: null, askedDirect: false, ...state }, messages: [{ role: 'user', content }] });
  await ask({ auditProgress: 2 }, 'What counts as a missed call?');
  assert.match(prompts[0], /question 2 of 4/);
  assert.ok(prompts[0].includes(AUDIT_QUESTIONS[1]));
  assert.match(prompts[0], /Do not ask that question/);
  await ask({ auditProgress: 'done' }, 'Do you work with commercial offices too?');
  assert.match(prompts[1], /finished the quick audit/);
  for (const auditProgress of [0, 5, '2', 'started']) await ask({ auditProgress }, 'Do you cover commercial offices as well?');
  assert.ok(prompts.slice(2).every((prompt) => !/CURRENT STATE/.test(prompt)), 'unknown progress values are ignored');

  const canned = await ask({ auditProgress: 1 }, "I'm missing calls");
  assert.ok(AUDIT_QUICK_REPLIES["I'm missing calls"].startsWith(canned.body.reply));
  assert.doesNotMatch(canned.body.reply, /Book my free audit/);
  const pricing = await ask({ auditProgress: 3 }, 'What does it cost?');
  assert.match(pricing.body.reply, /\$345 a month/);
  assert.doesNotMatch(pricing.body.reply, /Want me to book it/);
  const fresh = await ask({}, "I'm missing calls");
  assert.equal(fresh.body.reply, AUDIT_QUICK_REPLIES["I'm missing calls"], 'before the audit the invitation stays');
});

test('Markdown from the model is shown as plain text in the chat bubble', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ choices: [{ message: {
    content: '## What we do\n**Missed Call Rescue** texts back in seconds.\n\n- Quote Chaser\n* Quote Revival\n\nSee [our site](https://www.inventtomorrow.pro/).',
  } }] }));
  const response = await invoke({ experience: 'guided-audit', messages: [{ role: 'user', content: 'Which of your services helps with after-hours enquiries?' }] });
  assert.equal(response.body.reply, 'What we do\nMissed Call Rescue texts back in seconds.\n\n• Quote Chaser\n• Quote Revival\n\nSee our site (https://www.inventtomorrow.pro/).');
});

test('greetings and common questions are answered instantly with no AI call, even without an API key', async () => {
  const ask = (content, state) => invoke({ experience: 'guided-audit', ...(state ? { state } : {}), messages: [{ role: 'user', content }] });
  for (const [content, expected] of [
    ['hi', /Hello\. I'm Invo/], ['Hello!', /Hello\. I'm Invo/], ['thanks', /You're welcome/],
    ['Is the audit free?', /Yes\. The audit is free and takes 15 minutes\./], ['are you human?', /Invo, Invent Tomorrow's AI assistant/],
    ['what is the guarantee', /at least 200 past enquiries or quotes/], ['do I need new software?', /current tools can support it/],
    ['what is Quote Revival?', /contacts old quotes that never booked/], ['hi, I\'m missing calls', /Missed Call Rescue texts back/],
  ]) {
    const response = await ask(content);
    assert.equal(response.statusCode, 200, content);
    assert.match(response.body.reply, expected, content);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0, 'no external request');

  // Before the audit a fixed answer nudges toward it; once it has started, that nudge is left out.
  assert.match((await ask('Is the audit free?')).body.reply, /Book my free audit to get started\.$/);
  for (const auditProgress of [2, 'done']) {
    assert.doesNotMatch((await ask('Is the audit free?', { lead: null, askedDirect: false, auditProgress })).body.reply, /Book my free audit/);
  }
});

test('an unclear or multi-part message reaches the AI while fixed answers stay local', async () => {
  process.env.KOBOILLM_API_KEY = 'test-key';
  let modelCalls = 0;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    modelCalls++;
    return Response.json({ choices: [{ message: { content: 'Agent answer.' } }] });
  });
  const ask = (content) => invoke({ experience: 'guided-audit', sessionId: 'canned-session', messages: [{ role: 'user', content }] });
  assert.equal((await ask('Is the audit free and do you work with commercial offices?')).body.reply, 'Agent answer.');
  assert.equal(modelCalls, 1);
  const fixed = await ask('hi');
  assert.match(fixed.body.reply, /Hello\. I'm Invo/);
  assert.equal(modelCalls, 1, 'the greeting did not call the AI');
  assert.equal(globalThis.fetch.mock.callCount(), 1, 'chat does not submit transcript requests');
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

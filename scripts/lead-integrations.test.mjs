import assert from 'node:assert/strict';
import test from 'node:test';
import { parse } from 'dotenv';
import { recordLead, SHEET_HEADERS, sheetTabs, sheetsConfigurationStatus, syncLead } from '../server/leadIntegrations.ts';
import { deliverForm } from '../server/formDelivery.ts';
import { handleAudit } from '../server/audit.ts';
import { handleChat } from '../server/chat.ts';
import { BUSINESS_AUDIT_QUESTIONS } from '../src/utils/businessAudit.ts';
import { createAuthorization, SHEETS_SCOPE, updateRefreshToken } from './connect-gmail.mjs';
import { checkProductionSheets, sheetsConfigDigest, signSheetsCheck } from '../server/sheetsDiagnostic.ts';

const env = {
  GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'private-client-secret',
  GOOGLE_SHEETS_ENABLED: 'true', GOOGLE_SHEETS_REFRESH_TOKEN: 'private-sheet-token',
  GOOGLE_SHEETS_SPREADSHEET_ID: 'test-spreadsheet-123456',
  SLACK_LEAD_ALERTS_ENABLED: 'true', SLACK_BOT_TOKEN: 'private-slack-token', SLACK_CHANNEL_ID: 'C0123456789',
};
const lead = { name: '=IMPORTXML("bad")', businessName: '<!channel> Bright Home', email: 'dana@example.com', role: 'Owner' };
const audit = (id) => ({ kind: 'audit', submissionId: id, lead, pagePath: '/free-audit',
  answers: 'All sixteen answers', report: 'Full report including the third finding.', emailStatus: 'SENT',
  tracking: { utm_source: 'Google', gclid: 'ad-click', arbitrary_secret: 'do-not-save' } });

function fakeServices(t, { slackResponse = { ok: true, ts: '123.456' }, failSheet = false, reversed = false } = {}) {
  const books = Object.fromEntries(Object.entries(sheetTabs(env)).map(([kind, tab]) => [tab, {
    headers: reversed ? ['Operator Notes', ...SHEET_HEADERS[kind].toReversed()] : [...SHEET_HEADERS[kind]], rows: [],
  }]));
  const calls = [];
  const colIndex = (letters) => [...letters].reduce((n, letter) => n * 26 + letter.charCodeAt(0) - 64, 0) - 1;
  const implementation = async (urlValue, options = {}) => {
    const url = new URL(String(urlValue));
    const body = options.body && typeof options.body === 'string' && options.body.startsWith('{') ? JSON.parse(options.body) : undefined;
    calls.push({ url: url.toString(), options, body });
    if (url.hostname === 'oauth2.googleapis.com') return Response.json({ access_token: 'mock-access', token_type: 'Bearer' });
    if (url.hostname === 'gmail.googleapis.com') return Response.json({ id: 'accepted-message' });
    if (url.hostname === 'slack.com') return Response.json(slackResponse);
    assert.equal(url.hostname, 'sheets.googleapis.com', 'tests must never contact an unmocked service');
    if (failSheet) return new Response('PRIVATE provider response', { status: 403 });
    const decoded = decodeURIComponent(url.pathname);
    const parseRange = (range) => {
      const match = /^'((?:[^']|'')+)'!(.*)$/.exec(range);
      assert.ok(match, `Expected quoted A1 range: ${range}`);
      return { book: books[match[1].replaceAll("''", "'")], range: match[2] };
    };
    if (decoded.endsWith('/values:batchUpdate')) {
      assert.equal(body.valueInputOption, 'RAW');
      for (const change of body.data) {
        const { book, range } = parseRange(change.range);
        const cell = /^([A-Z]+)(\d+)$/.exec(range);
        book.rows[Number(cell[2]) - 2][colIndex(cell[1])] = change.values[0][0];
      }
      return Response.json({ totalUpdatedCells: body.data.length });
    }
    const { book, range } = parseRange(decoded.split('/values/')[1].replace(/:append$/, ''));
    assert.ok(book);
    if (options.method === 'PUT') {
      assert.equal(url.searchParams.get('valueInputOption'), 'RAW');
      const row = Number(/\d+/.exec(range)[0]) - 2;
      book.rows[row] = [...body.values[0]];
      return Response.json({ updatedRows: 1 });
    }
    if (decoded.endsWith(':append')) {
      assert.equal(url.searchParams.get('valueInputOption'), 'RAW');
      book.rows.push([...body.values[0]]);
      return Response.json({ updates: { updatedRange: `'tab'!A${book.rows.length + 1}:Z${book.rows.length + 1}` } });
    }
    if (range === '1:1') return Response.json({ values: [book.headers] });
    if (/^\d+:\d+$/.test(range)) return Response.json({ values: [book.rows[Number(range.split(':')[0]) - 2]] });
    const key = /^([A-Z]+)2:[A-Z]+$/.exec(range);
    assert.ok(key, range);
    return Response.json({ values: book.rows.map(row => [row[colIndex(key[1])]]) });
  };
  const fetchMock = t.mock.method(globalThis, 'fetch', implementation);
  return { books, calls, fetchMock, implementation,
    row(kind, index = 0) {
      const book = books[sheetTabs(env)[kind]];
      return Object.fromEntries(book.headers.map((header, column) => [header, book.rows[index]?.[column]]));
    } };
}

test('Sheets consent requests a separate offline grant and token saving preserves Gmail configuration', () => {
  const auth = createAuthorization('client', SHEETS_SCOPE);
  assert.equal(auth.url.searchParams.get('scope'), SHEETS_SCOPE);
  assert.equal(auth.url.searchParams.get('access_type'), 'offline');
  assert.equal(auth.url.searchParams.get('code_challenge_method'), 'S256');
  const updated = updateRefreshToken('GMAIL_REFRESH_TOKEN=keep\nGOOGLE_SHEETS_REFRESH_TOKEN=old\n', 'sheets-$&-token', 'GOOGLE_SHEETS_REFRESH_TOKEN');
  assert.equal(parse(updated).GMAIL_REFRESH_TOKEN, 'keep');
  assert.equal(parse(updated).GOOGLE_SHEETS_REFRESH_TOKEN, 'sheets-$&-token');
  assert.throws(() => updateRefreshToken('', 'token', 'VITE_TOKEN'), /Invalid/);
});

test('disabled integrations make no external requests', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('Must not fetch'); });
  assert.deepEqual(await syncLead(audit('disabled'), {}), { saved: false, alerted: false, code: 'SHEETS_DISABLED' });
  await recordLead(audit('disabled-background'), {}, () => assert.fail('Must not queue'));
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('production configuration checks expose only readiness and do not treat partial settings as configured', () => {
  assert.equal(sheetsConfigurationStatus({}), 'disabled');
  assert.equal(sheetsConfigurationStatus({ ...env, GOOGLE_SHEETS_ENABLED: 'false' }), 'disabled');
  for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_SHEETS_REFRESH_TOKEN', 'GOOGLE_SHEETS_SPREADSHEET_ID']) {
    assert.equal(sheetsConfigurationStatus({ ...env, [key]: '' }), 'incomplete');
  }
  assert.equal(sheetsConfigurationStatus(env), 'configured');
});

test('production Google access checks reject missing, tampered and expired owner signatures before fetching', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unauthorized check fetched'); });
  const input = { timestamp: String(Date.now()), nonce: 'a'.repeat(32), expectedConfig: sheetsConfigDigest(env) };
  const signature = signSheetsCheck(input, env.GOOGLE_CLIENT_SECRET);
  for (const raw of [null, {}, { ...input, signature: '0'.repeat(64) }, { ...input, signature, nonce: 'b'.repeat(32) }]) {
    assert.equal((await checkProductionSheets(raw, env)).status, 401);
  }
  assert.equal((await checkProductionSheets({ ...input, signature }, env, Date.now() + 120_000)).status, 401);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('authenticated production checks validate deployed credentials and schemas without writes or secret disclosure', async (t) => {
  const service = fakeServices(t);
  service.fetchMock.mock.mockImplementation(async (url, options) => new URL(String(url)).searchParams.has('fields')
    ? Response.json({ sheets: [] }) : service.implementation(url, options));
  const input = { timestamp: String(Date.now()), nonce: 'c'.repeat(32), expectedConfig: sheetsConfigDigest(env) };
  const result = await checkProductionSheets({ ...input, signature: signSheetsCheck(input, env.GOOGLE_CLIENT_SECRET) }, env);
  assert.equal(result.status, 200);
  assert.equal(result.body.googleAccess, true);
  assert.equal(result.body.matchesExpected, true);
  assert.ok(result.body.tabs.every(tab => tab.ready));
  assert.doesNotMatch(JSON.stringify(result), /private-|mock-access|test-spreadsheet/);
  assert.ok(service.calls.every(call => call.url.includes('oauth2') || !call.options.method || call.options.method === 'GET'));
});

test('new audit rows preserve report, answers and attribution as literal text; Slack follows the sheet write', async (t) => {
  const service = fakeServices(t, { reversed: true });
  assert.deepEqual(await syncLead(audit('audit-new'), env), { saved: true, alerted: true });
  const row = service.row('audit');
  assert.equal(row.Name, lead.name);
  assert.equal(row['Business Name'], lead.businessName);
  assert.equal(row.Answers, 'All sixteen answers');
  assert.equal(row['Email Content'], audit('').report);
  assert.equal(row['Email Status'], 'SENT');
  assert.equal(row['Report Status'], 'GENERATED');
  assert.equal(row['Slack Status'], 'SENT');
  assert.equal(row['Slack Message ID'], '123.456');
  assert.deepEqual(JSON.parse(row.Tracking), { utm_source: 'Google', gclid: 'ad-click' });
  const append = service.calls.findIndex(call => call.url.includes(':append'));
  const post = service.calls.findIndex(call => call.url.includes('slack.com'));
  assert.ok(post > append);
  const message = service.calls[post].body;
  assert.equal(message.channel, env.SLACK_CHANNEL_ID);
  assert.equal(message.blocks[0].text.type, 'plain_text');
  assert.ok(message.blocks[0].text.text.includes('<!channel> Bright Home'));
  assert.equal(message.unfurl_links, false);
  const refresh = new URLSearchParams(service.calls[0].options.body);
  assert.equal(refresh.get('refresh_token'), env.GOOGLE_SHEETS_REFRESH_TOKEN);
});

test('sequential retries update a matched row, preserve unknown columns and suppress acknowledged Slack alerts', async (t) => {
  const service = fakeServices(t, { reversed: true });
  await syncLead(audit('audit-retry'), env);
  const book = service.books[sheetTabs(env).audit];
  book.rows[0][0] = 'Operator reviewed';
  const originalDate = service.row('audit')['Submitted At'];
  await syncLead({ ...audit('audit-retry'), report: 'Updated full report' }, env);
  assert.equal(book.rows.length, 1);
  assert.equal(service.row('audit')['Operator Notes'], 'Operator reviewed');
  assert.equal(service.row('audit')['Email Content'], 'Updated full report');
  assert.equal(service.row('audit')['Submitted At'], originalDate);
  assert.equal(service.calls.filter(call => call.url.includes('slack.com')).length, 1);
  const updates = service.calls.filter(call => call.url.includes('/values:batchUpdate')).flatMap(call => call.body.data);
  assert.ok(updates.every(update => !update.range.endsWith('!A2')), 'operator columns and formulas must never be rewritten');
});

test('overlapping retries in one process serialize sheet writes and Slack delivery', async (t) => {
  const service = fakeServices(t);
  await Promise.all([syncLead(audit('overlap'), env), syncLead(audit('overlap'), env)]);
  assert.equal(service.books[sheetTabs(env).audit].rows.length, 1);
  assert.equal(service.calls.filter(call => call.url.includes('slack.com')).length, 1);
});

test('sheet permission errors and invalid schema never post to Slack or leak private responses', async (t) => {
  const service = fakeServices(t, { failSheet: true });
  const failed = await syncLead(audit('forbidden'), env);
  assert.deepEqual(failed, { saved: false, alerted: false, code: 'SHEETS_PERMISSION_DENIED' });
  assert.doesNotMatch(JSON.stringify(failed), /PRIVATE|private-/);
  assert.equal(service.calls.filter(call => call.url.includes('slack.com')).length, 0);
  t.mock.restoreAll();
  const mismatch = fakeServices(t);
  mismatch.books[sheetTabs(env).audit].headers = ['Name'];
  assert.equal((await syncLead(audit('schema'), env)).code, 'SHEETS_SCHEMA_MISMATCH');
  assert.equal(mismatch.calls.filter(call => call.options.method === 'PUT' || call.url.includes('slack.com')).length, 0);
});

test('HTTP 200 with Slack ok:false retains the saved row and unconfirmed status for operator review', async (t) => {
  const service = fakeServices(t, { slackResponse: { ok: false, error: 'PRIVATE invalid_auth' } });
  assert.deepEqual(await syncLead(audit('slack-failed'), env), { saved: true, alerted: false, code: 'SLACK_SEND_FAILED' });
  assert.equal(service.row('audit')['Slack Status'], 'PENDING');
  assert.equal(service.row('audit')['Slack Message ID'], '');
  assert.equal(service.row('audit')['Email Status'], 'SENT');
});

test('Slack may be disabled independently while Sheets still stores the lead', async (t) => {
  const service = fakeServices(t);
  const result = await syncLead(audit('slack-disabled'), { ...env, SLACK_LEAD_ALERTS_ENABLED: 'false' });
  assert.deepEqual(result, { saved: true, alerted: false });
  assert.equal(service.row('audit')['Slack Status'], 'DISABLED');
  assert.equal(service.calls.filter(call => call.url.includes('slack.com')).length, 0);
});

test('booking and case-study forms retain original column mappings and accurate Gmail status', async (t) => {
  const service = fakeServices(t);
  const gmailEnv = { ...env, GMAIL_FORM_NOTIFICATIONS_ENABLED: 'true', GMAIL_REFRESH_TOKEN: 'gmail-only-token', GMAIL_SENDER_EMAIL: 'reports@example.com' };
  const details = { 'appointment datetime': '2999-12-01T10:30', appointmentTimeZone: 'America/New_York' };
  assert.equal((await deliverForm({ subject: 'New audit request - Invent Tomorrow', submissionId: 'booking-id',
    lead: { ...lead, phone: '+12022345678', description: 'Quiet quotes' }, details }, gmailEnv)).sent, true);
  const booking = service.row('booking');
  assert.equal(booking['Bussiness Name'], lead.businessName);
  assert.equal(booking.Appointment_dateTime, details['appointment datetime']);
  assert.equal(booking['Appointment Time Zone'], details.appointmentTimeZone);
  assert.equal(booking['Email Status'], 'SENT');
  await deliverForm({ subject: 'Case study unlocked - Invent Tomorrow', submissionId: 'case-id', lead,
    details: { caseStudy: 'bright-home' }, tracking: { utm_campaign: 'spring', fbclid: 'click' } }, env);
  const caseStudy = service.row('case-study');
  assert.equal(caseStudy['Case Study'], 'bright-home');
  assert.equal(caseStudy['UTM Campaign'], 'spring');
  assert.equal(caseStudy['Click ID'], 'click');
  assert.equal(caseStudy['Email Status'], 'DISABLED');
});

test('background retention does not wait for optional integrations or alter accepted email delivery', async (t) => {
  const service = fakeServices(t, { failSheet: true });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  service.fetchMock.mock.mockImplementation(async (url, options) => {
    if (String(url).includes('oauth2') && new URLSearchParams(options.body).get('refresh_token') === env.GOOGLE_SHEETS_REFRESH_TOKEN) await gate;
    return service.implementation(url, options);
  });
  t.mock.method(console, 'warn', () => {});
  const pending = [];
  const gmailEnv = { ...env, GMAIL_FORM_NOTIFICATIONS_ENABLED: 'true', GMAIL_REFRESH_TOKEN: 'gmail-only-token', GMAIL_SENDER_EMAIL: 'reports@example.com' };
  const delivery = await deliverForm({ subject: 'Audit request', submissionId: 'async-id', lead }, gmailEnv, task => pending.push(task));
  assert.equal(delivery.sent, true);
  assert.equal(pending.length, 1);
  release();
  await Promise.all(pending);
  assert.equal(console.warn.mock.callCount(), 1);
  assert.doesNotMatch(JSON.stringify(console.warn.mock.calls[0].arguments), /PRIVATE|private-/);
});

test('chat conversations do not access Sheets when the history tab has been deleted', async (t) => {
  const service = fakeServices(t);
  const body = { experience: 'guided-audit', sessionId: 'session-history-123456', messages: [{ role: 'user', content: 'What do you do?' }] };
  const response = await handleChat(body, 'history-test', env);
  assert.equal(response.status, 200);
  assert.ok(response.body.reply);
  assert.deepEqual(Object.keys(sheetTabs(env)).sort(), ['audit', 'booking', 'case-study']);
  assert.equal(service.calls.length, 0);
});

test('the full audit handler stores all sixteen answers and all report sections with email disabled', async (t) => {
  const service = fakeServices(t);
  const modelReply = {
    bigPicture: 'Review your existing enquiries.', overview: 'A small cleaning team.',
    findings: [
      { heading: 'Missed calls', body: 'Review call response times. '.repeat(10), evidenceIds: ['A5', 'A6'] },
      { heading: 'Quiet quotes', body: 'Review quote follow ups. '.repeat(10), evidenceIds: ['A9'] },
      { heading: 'Older enquiries', body: 'Review older enquiries carefully. '.repeat(10), evidenceIds: ['A10', 'A11'] },
    ], whyThisMatters: 'Existing conversations may have value.', nextConversation: 'Review actual records together.',
  };
  service.fetchMock.mock.mockImplementation(async (url, options) => String(url).endsWith('/chat/completions')
    ? Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(modelReply) } }] })
    : service.implementation(url, options));
  // Use the fake services implementation for every request other than the AI call.
  const answers = Object.fromEntries(BUSINESS_AUDIT_QUESTIONS.map(question => [question.id,
    question.maxSelections ? question.options.slice(0, 2) : question.options[0]]));
  const response = await handleAudit({ mode: 'cleaning_business_audit', ...lead, businessName: 'Report Test Cleaning',
    submissionId: 'integration-full-audit-123456', pagePath: '/free-audit', answers }, 'full-integration-test', { ...env, KOBOILLM_API_KEY: 'mock-ai-key' });
  assert.equal(response.status, 200);
  assert.equal(response.body.reportEmailSent, false);
  const row = service.row('audit');
  for (const question of BUSINESS_AUDIT_QUESTIONS) assert.ok(row.Answers.includes(`(${question.id})`), question.id);
  assert.ok(row['Email Content'].includes(modelReply.findings[2].body.trim()));
  assert.ok(row['Email Content'].includes(modelReply.nextConversation));
  assert.equal(row['Email Status'], 'DISABLED');
});

test('valid audit leads are still recorded and alerted when report generation is unavailable', async (t) => {
  const service = fakeServices(t);
  const answers = Object.fromEntries(BUSINESS_AUDIT_QUESTIONS.map(question => [question.id,
    question.maxSelections ? question.options.slice(0, 2) : question.options[0]]));
  const response = await handleAudit({ mode: 'cleaning_business_audit', ...lead, businessName: 'Unavailable Model Cleaning',
    submissionId: 'integration-failed-ai-123456', pagePath: '/free-audit', answers }, 'failed-ai-integration', env);
  assert.equal(response.status, 503);
  assert.equal(service.row('audit')['Report Status'], 'FAILED');
  assert.equal(service.row('audit')['Email Status'], 'FAILED');
  assert.equal(service.row('audit').Email, lead.email);
  assert.equal(service.row('audit')['Slack Status'], 'SENT');
});

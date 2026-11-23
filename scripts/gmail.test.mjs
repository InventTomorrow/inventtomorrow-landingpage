import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { parse } from 'dotenv';
import { sendAuditReportEmail } from '../server/gmail.ts';
import { callbackCode, createAuthorization, GMAIL_SCOPE, REDIRECT_URI, updateRefreshToken } from './connect-gmail.mjs';

const env = {
  GMAIL_AUDIT_REPORTS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret',
  GMAIL_REFRESH_TOKEN: 'test-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com',
};
const input = (id) => ({ to: 'lead@example.com', submissionId: id, text: 'FULL REPORT\nThird finding: résumé — café\nThe next conversation.' });
const token = () => Response.json({ access_token: 'test-access', token_type: 'Bearer' });

test('owner authorization requests only sending permission with offline access, state and PKCE', () => {
  const auth = createAuthorization('client-id');
  assert.equal(auth.url.origin, 'https://accounts.google.com');
  assert.equal(auth.url.searchParams.get('scope'), GMAIL_SCOPE);
  assert.equal(auth.url.searchParams.get('access_type'), 'offline');
  assert.equal(auth.url.searchParams.get('prompt'), 'consent');
  assert.equal(auth.url.searchParams.get('redirect_uri'), REDIRECT_URI);
  assert.equal(auth.url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(auth.url.searchParams.get('code_challenge'), createHash('sha256').update(auth.verifier).digest('base64url'));
  const callback = new URL(REDIRECT_URI);
  callback.search = new URLSearchParams({ code: 'one-time-code', state: auth.state }).toString();
  assert.equal(callbackCode(callback, auth.state), 'one-time-code');
  assert.throws(() => callbackCode(callback, 'forged-state'), /state/);
  callback.searchParams.set('error', 'access_denied');
  assert.throws(() => callbackCode(callback, auth.state), /not granted/);
  assert.notEqual(createAuthorization('client-id').state, auth.state);
});

test('saving refresh tokens retains unrelated local configuration without substitution or newline injection', () => {
  const source = '# Existing config\r\nOTHER_KEY=unchanged\r\nGMAIL_REFRESH_TOKEN=old\r\n';
  const result = updateRefreshToken(source, 'replacement-$&-token');
  assert.equal(parse(result).GMAIL_REFRESH_TOKEN, 'replacement-$&-token');
  assert.equal(parse(result).OTHER_KEY, 'unchanged');
  assert.ok(result.includes('# Existing config'));
  assert.equal(parse(updateRefreshToken('OTHER_KEY=unchanged', 'new')).GMAIL_REFRESH_TOKEN, 'new');
});

test('disabled, missing credentials and unsafe headers never contact Google', async (t) => {
  const calls = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected request'); });
  assert.deepEqual(await sendAuditReportEmail(input('disabled'), {}), { sent: false, code: 'GMAIL_DISABLED' });
  assert.deepEqual(await sendAuditReportEmail(input('unconfigured'), { ...env, GMAIL_REFRESH_TOKEN: '' }), { sent: false, code: 'GMAIL_NOT_CONFIGURED' });
  for (const to of ['lead@example.com\r\nBcc: victim@example.com', 'one@example.com,two@example.com', 'Lead <lead@example.com>', 'invalid']) {
    assert.equal((await sendAuditReportEmail({ ...input('invalid'), to }, env)).sent, false);
  }
  assert.equal((await sendAuditReportEmail(input('unsafe-from'), { ...env, GMAIL_SENDER_EMAIL: 'x@example.com\r\nBcc: victim@example.com' })).sent, false);
  assert.equal(calls.mock.callCount(), 0);
});

test('Gmail refreshes access and sends UTF-8 MIME containing the entire report, coalescing retries', async (t) => {
  let exchanges = 0;
  let sends = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === 'https://oauth2.googleapis.com/token') {
      exchanges++;
      assert.equal(options.body.get('grant_type'), 'refresh_token');
      assert.equal(options.body.get('refresh_token'), env.GMAIL_REFRESH_TOKEN);
      assert.equal(options.body.get('client_secret'), env.GOOGLE_CLIENT_SECRET);
      return token();
    }
    sends++;
    assert.equal(url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
    assert.equal(options.headers.Authorization, 'Bearer test-access');
    const raw = JSON.parse(options.body).raw;
    assert.doesNotMatch(raw, /[+/=]/);
    const mime = Buffer.from(raw, 'base64url').toString('utf8');
    const [headers, body] = mime.split('\r\n\r\n');
    assert.match(headers, /From: Invent Tomorrow <reports@example.com>/);
    assert.match(headers, /To: (?:lead|other)@example.com\r\n/);
    assert.match(headers, /Content-Type: text\/plain; charset=UTF-8/);
    assert.match(headers, /Subject: Your cleaning business audit - Invent Tomorrow\r\n/);
    assert.equal(Buffer.from(body, 'base64').toString('utf8'), input('mime').text.replace(/\n/g, '\r\n'));
    return Response.json({ id: 'accepted-message' });
  });
  const message = input('concurrent-and-retry');
  assert.deepEqual(await Promise.all([sendAuditReportEmail(message, env), sendAuditReportEmail(message, env)]), [{ sent: true }, { sent: true }]);
  assert.deepEqual(await sendAuditReportEmail(message, env), { sent: true });
  assert.equal(exchanges, 1);
  assert.equal(sends, 1);
  assert.equal((await sendAuditReportEmail({ ...message, to: 'other@example.com' }, env)).sent, true);
  assert.equal(sends, 2, 'recipient participates in the deduplication key');
});

test('Google failures, malformed acknowledgements and timeouts never report sent or expose secrets', async (t) => {
  const cases = [
    { auth: () => new Response('PRIVATE test-secret', { status: 400 }) },
    { auth: () => Response.json({ access_token: '' }) },
    { auth: () => Response.json(null) },
    { send: () => new Response('PRIVATE test-refresh', { status: 429 }) },
    { send: () => Response.json({}) },
    { send: () => Response.json(null) },
    { send: () => new Response('not json') },
    { send: () => { throw new DOMException('PRIVATE test-access', 'TimeoutError'); } },
  ];
  for (const [index, scenario] of cases.entries()) {
    t.mock.method(globalThis, 'fetch', async (url) => url === 'https://oauth2.googleapis.com/token'
      ? (scenario.auth || token)() : scenario.send());
    const result = await sendAuditReportEmail(input(`failure-${index}`), env);
    assert.equal(result.sent, false);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE|test-secret|test-refresh|test-access/);
    t.mock.restoreAll();
  }
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url) => { calls++; return url.includes('oauth2') ? token() : Response.json({ id: 'retried' }); });
  assert.equal((await sendAuditReportEmail(input('failure-0'), env)).sent, true, 'failed attempts can be retried');
  assert.equal(calls, 2);
});

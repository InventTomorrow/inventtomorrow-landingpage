// Read-only check of the QStash settings the chat uses. Sends nothing to n8n and writes nothing.
//   npm run check:qstash
// Reads QSTASH_TOKEN / QSTASH_URL (and the n8n webhook settings) from the environment, falling back to .env.local.
import { readFileSync } from 'node:fs';

const env = { ...process.env };
try {
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && env[match[1]] === undefined) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
} catch { /* no .env.local: the process environment is enough */ }

const fail = (message) => { console.error(`✖ ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`✔ ${message}`);

const token = env.QSTASH_TOKEN?.trim();
const base = (env.QSTASH_URL?.trim() || 'https://qstash.upstash.io').replace(/\/+$/, '');
const production = env.N8N_USE_PRODUCTION === 'true';
const destination = (production ? env.N8N_WEBHOOK_URL : env.N8N_WEBHOOK_TEST_URL)?.trim();
const queue = `invo-chat-${production ? 'production' : 'test'}`;

if (!token) {
  fail('QSTASH_TOKEN is not set, so chat history is sent straight to n8n and every reply waits for it.');
  console.log('\nGet the token and URL from console.upstash.com → QStash, then add both as server-only');
  console.log('Environment Variables on Vercel (Production) and redeploy. See docs/chat-logging.md.');
  process.exit();
}
ok('QSTASH_TOKEN is set');
ok(`QStash URL: ${base}${env.QSTASH_URL ? '' : ' (default; use the URL shown in your Upstash account if it differs)'}`);

if (destination) {
  try { ok(`n8n destination (${production ? 'production' : 'test'}): ${new URL(destination).host}`); }
  catch { fail('The n8n webhook URL is not a valid URL.'); }
} else {
  fail(`No n8n webhook URL for ${production ? 'production (N8N_WEBHOOK_URL)' : 'test (N8N_WEBHOOK_TEST_URL)'}.`);
}

try {
  const response = await fetch(`${base}/v2/queues`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) });
  if (response.status === 401 || response.status === 403) {
    fail('QStash rejected the token. Check that it is the token from the same region as QSTASH_URL.');
  } else if (!response.ok) {
    fail(`QStash answered HTTP ${response.status}.`);
  } else {
    ok('QStash accepted the token');
    const queues = await response.json();
    const found = Array.isArray(queues) ? queues.find((item) => item.name === queue) : null;
    if (!found) console.log(`ℹ Queue "${queue}" does not exist yet. It is created automatically on the first chat message; make sure its parallelism is 1.`);
    else if (found.parallelism !== 1) fail(`Queue "${queue}" has parallelism ${found.parallelism}; set it to 1 so snapshots arrive in order.`);
    else ok(`Queue "${queue}" exists with parallelism 1`);
  }
} catch (error) {
  fail(`Could not reach QStash: ${error instanceof Error ? error.message : error}`);
}

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parse } from 'dotenv';
import { sheetsConfigDigest, signSheetsCheck } from '../server/sheetsDiagnostic.ts';

async function main() {
  const env = parse(readFileSync(new URL('../.env.production.local', import.meta.url), 'utf8'));
  if (!env.GOOGLE_CLIENT_SECRET?.trim()) throw new Error('The private production env file needs the Google client secret.');
  const input = { timestamp: String(Date.now()), nonce: randomBytes(16).toString('hex'), expectedConfig: sheetsConfigDigest(env) };
  const response = await fetch('https://www.inventtomorrow.pro/api/audit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify({ mode: 'sheets_connection_check', ...input, signature: signSheetsCheck(input, env.GOOGLE_CLIENT_SECRET) }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`Production check returned HTTP ${response.status}. Verify the deployed code and matching Google client secret.`);
  const result = await response.json();
  console.log(JSON.stringify({ configuration: result.configuration, matchesExpected: result.matchesExpected,
    googleAccess: result.googleAccess, code: result.code,
    tabs: result.tabs?.map(tab => ({ kind: tab.kind, ready: tab.ready })),
  }, null, 2));
  console.log('Read-only check: no emails, lead rows or Slack messages were sent.');
  if (result.configuration !== 'configured' || result.matchesExpected !== true || result.googleAccess !== true || result.tabs?.some(tab => !tab.ready)) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

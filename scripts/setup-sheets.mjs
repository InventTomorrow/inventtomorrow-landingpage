// Explicit one-time setup: add missing tabs/headers without deleting existing rows or columns.
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { SHEET_HEADERS, columnName, sheetRange, sheetTabs, sheetsAccessToken, sheetsRequest } from '../server/leadIntegrations.ts';

async function main() {
  let local = '';
  try { local = readFileSync(new URL('../.env.local', import.meta.url), 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const env = { ...parse(local), ...process.env };
  if (!env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim()) throw new Error('Set GOOGLE_SHEETS_SPREADSHEET_ID in .env.local first.');
  const tabs = sheetTabs(env);
  if (new Set(Object.values(tabs)).size !== Object.keys(tabs).length) throw new Error('Configure distinct sheet tab names.');
  const signal = AbortSignal.timeout(60_000);
  const token = await sheetsAccessToken(env, signal);
  const request = (suffix, method = 'GET', body) => sheetsRequest(env, token, suffix, signal, method, body);
  const workbook = await request('?fields=sheets.properties');
  const titles = new Set((workbook.sheets || []).map(sheet => sheet.properties.title));
  for (const [kind, title] of Object.entries(tabs)) {
    if (!titles.has(title)) await request(':batchUpdate', 'POST', { requests: [{ addSheet: { properties: { title } } }] });
    const headerPath = `/values/${encodeURIComponent(sheetRange(title, '1:1'))}`;
    const data = await request(headerPath);
    const headers = data.values?.[0] || [];
    const nonempty = headers.map(value => String(value).trim()).filter(Boolean);
    if (new Set(nonempty).size !== nonempty.length) throw new Error('Duplicate column headers found. Resolve them before running setup again.');
    const missing = SHEET_HEADERS[kind].filter(header => !nonempty.includes(header));
    if (missing.length) {
      const range = sheetRange(title, `${columnName(headers.length)}1:${columnName(headers.length + missing.length - 1)}1`);
      await request(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, 'PUT', { values: [missing] });
    }
    console.log(`${kind}: ready (${missing.length} headers added). Existing data retained.`);
  }
  console.log('Set GOOGLE_SHEETS_ENABLED=true. Configure Slack separately in docs/lead-integrations-setup.md.');
  console.log('No lead rows, emails or Slack messages were sent.');
}

main().catch((error) => {
  // Never print provider responses, credentials or sheet contents.
  const advice = {
    SHEETS_PERMISSION_DENIED: 'The authorized account needs Editor access to the configured spreadsheet.',
    SHEETS_NOT_FOUND: 'Check the spreadsheet ID and the authorized account’s access.',
    SHEETS_AUTH_FAILED: 'Run npm run connect:sheets again.',
    SHEETS_API_DISABLED: 'Enable Google Sheets API in the Google Cloud project that owns the OAuth client.',
    SHEETS_SCOPE_MISSING: 'Run npm run connect:sheets and approve the Sheets permission.',
    SHEETS_NOT_CONFIGURED: 'Set the Google OAuth client, Sheets refresh token and spreadsheet ID.',
  }[error?.code] || 'Check the spreadsheet ID, Editor access, API enablement, token and duplicate headers.';
  console.error(`Sheet setup failed. ${advice} See docs/lead-integrations-setup.md.`);
  process.exitCode = 1;
});

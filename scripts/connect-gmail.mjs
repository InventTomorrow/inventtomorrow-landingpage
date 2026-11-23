// One-time owner authorization. No public OAuth/token endpoints are deployed.
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'dotenv';

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const REDIRECT_URI = 'http://127.0.0.1:53682/oauth/google/callback';

export function createAuthorization(clientId) {
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId, redirect_uri: REDIRECT_URI, response_type: 'code', scope: GMAIL_SCOPE,
    access_type: 'offline', prompt: 'consent', state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
  }).toString();
  return { url, state, verifier };
}

export function callbackCode(url, state) {
  if (url.pathname !== new URL(REDIRECT_URI).pathname || url.searchParams.get('state') !== state) {
    throw new Error('Invalid OAuth callback state.');
  }
  if (url.searchParams.has('error') || !url.searchParams.get('code')) throw new Error('Gmail authorization was not granted.');
  return url.searchParams.get('code');
}

// Update only this key; retain all existing local configuration and comments.
export function updateRefreshToken(source, token) {
  const entry = `GMAIL_REFRESH_TOKEN=${JSON.stringify(token)}`;
  const pattern = /^\s*(?:export\s+)?GMAIL_REFRESH_TOKEN\s*=.*$/gm;
  return pattern.test(source) ? source.replace(pattern, () => entry) : `${source}${source.endsWith('\n') || !source ? '' : '\n'}${entry}\n`;
}

async function main() {
  const envPath = fileURLToPath(new URL('../.env.local', import.meta.url));
  let local = '';
  try { local = readFileSync(envPath, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const env = { ...parse(local), ...process.env };
  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first. See docs/gmail-setup.md.');
  const auth = createAuthorization(clientId);
  let processing = false;
  await new Promise((resolve, reject) => {
    const finish = (error) => {
      clearTimeout(timer);
      server.close();
      if (error) reject(error); else resolve();
    };
    const server = createServer(async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
      const url = new URL(req.url || '/', REDIRECT_URI);
      if (req.method !== 'GET' || url.pathname !== new URL(REDIRECT_URI).pathname) {
        res.writeHead(404).end('Not found.'); return;
      }
      // Ignore forged callbacks without consuming the real owner's authorization.
      if (url.searchParams.get('state') !== auth.state || processing) {
        res.writeHead(400).end('Invalid or already-used callback.'); return;
      }
      processing = true;
      try {
        const code = callbackCode(url, auth.state);
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code,
            redirect_uri: REDIRECT_URI, grant_type: 'authorization_code', code_verifier: auth.verifier }),
          signal: AbortSignal.timeout(20_000),
        });
        if (!response.ok) throw new Error('Google rejected the token exchange. Check the OAuth client and redirect URI.');
        const tokens = await response.json();
        if (typeof tokens.scope !== 'string' || !tokens.scope.split(' ').includes(GMAIL_SCOPE)
          || typeof tokens.refresh_token !== 'string' || !tokens.refresh_token.trim()) {
          throw new Error('Google did not grant Gmail sending with offline access. Run the command again and approve the sending permission.');
        }
        // Re-read so other local edits made during consent are retained.
        let current = '';
        try { current = readFileSync(envPath, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        writeFileSync(envPath, updateRefreshToken(current, tokens.refresh_token), { mode: 0o600 });
        res.end('Gmail connected. You can close this tab and return to your terminal.');
        console.log('Saved GMAIL_REFRESH_TOKEN to .env.local (not printed).');
        console.log('Set GMAIL_SENDER_EMAIL to the authorized mailbox, then GMAIL_AUDIT_REPORTS_ENABLED=true.');
        console.log('For production, add the Gmail settings to Vercel and redeploy. See docs/gmail-setup.md.');
        finish();
      } catch (error) {
        res.writeHead(400).end('Could not connect Gmail. Check your terminal for setup instructions.');
        // Do not print exceptions from fetch or Google response bodies.
        finish(new Error(error instanceof TypeError || error?.name === 'TimeoutError'
          ? 'Google could not be reached. Run the command again.' : 'Gmail authorization failed. Check the client, consent and redirect URI in docs/gmail-setup.md.'));
      }
    });
    const timer = setTimeout(() => finish(new Error('Gmail authorization timed out after five minutes. Run the command again.')), 5 * 60_000);
    server.once('error', () => finish(new Error('Could not start the Gmail callback on 127.0.0.1:53682. Check whether that port is in use.')));
    server.listen(53682, '127.0.0.1', () => {
      console.log('Open this URL in your browser and sign in to the mailbox that will send audit reports:');
      console.log(auth.url.toString());
      console.log('Waiting for Google consent (five-minute timeout). No email will be sent by this setup command.');
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

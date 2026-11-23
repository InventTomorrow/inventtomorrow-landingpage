import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export async function inspectDeployment({ baseUrl, commit, fetchImpl = fetch }) {
  if (!/^[a-f0-9]{40}$/i.test(commit || '')) throw new Error('A full expected Git commit SHA is required.');
  const origin = new URL(baseUrl);
  if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('An HTTP(S) production URL is required.');
  const request = (pathname) => {
    const url = new URL(pathname, origin);
    url.searchParams.set('release_check', commit);
    return fetchImpl(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15_000) });
  };
  const manifestResponse = await request('/release.json');
  if (!manifestResponse.ok) throw new Error(`Release manifest returned HTTP ${manifestResponse.status}; the domain has not published the verified build.`);
  let release;
  try { release = await manifestResponse.json(); } catch { throw new Error('The domain did not return a valid release manifest.'); }
  if (release?.commitSha !== commit) throw new Error(`Domain is serving commit ${typeof release?.commitSha === 'string' ? release.commitSha.slice(0, 12) : 'unknown'}; expected ${commit.slice(0, 12)}.`);
  if (release.auditExperience !== 'cleaning-business-audit-v1') throw new Error('Release manifest does not identify the current audit experience.');
  if (!manifestResponse.headers.get('cache-control')?.includes('no-store')) throw new Error('Release manifest is missing its no-store cache policy.');

  const pages = await Promise.all(['/free-audit', '/free-audit-ads'].map(async (route) => {
    const response = await request(route);
    if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}.`);
    const html = await response.text();
    if (!html.includes(`name="deployment-commit" content="${commit}"`)) throw new Error(`${route} does not belong to the expected deployment.`);
    if (!html.includes('Cleaning Business Audit') || !html.includes('Answer 16 quick questions') || !html.includes('Start my free audit') || /id=["']audit-chat-input["']/.test(html)) {
      throw new Error(`${route} is not serving the current 16-question questionnaire.`);
    }
    if (!response.headers.get('cache-control')?.includes('no-store')) throw new Error(`${route} is missing its no-store cache policy.`);
    return route;
  }));
  await Promise.all(['/api/chat', '/api/audit'].map(async (route) => {
    const response = await request(route);
    if (response.status !== 405) throw new Error(`${route} startup check returned HTTP ${response.status}; expected 405.`);
  }));
  return { commit: release.commitSha, pages, builtAt: release.builtAt };
}

async function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
  const baseUrl = value('--base-url', 'https://www.inventtomorrow.pro');
  const commit = value('--commit');
  const attempts = Number(value('--attempts', '1'));
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 60) throw new Error('Attempts must be between 1 and 60.');
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await inspectDeployment({ baseUrl, commit });
      console.log(`Verified production ${new URL(baseUrl).origin}: commit ${result.commit.slice(0, 12)}, both questionnaire pages and both API entry points.`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Production check ${attempt}/${attempts}: ${error.message}`);
      if (attempt < attempts) await delay(10_000);
    }
  }
  throw new Error(`Production was not verified. ${lastError?.message} Check the Vercel production deployment and custom-domain assignment.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectDeployment } from './verify-live-deployment.mjs';

const commit = 'a'.repeat(40);
const headers = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' };
const currentHtml = `<meta name="deployment-commit" content="${commit}"><h1>Cleaning Business Audit</h1><p>Answer 16 quick questions</p><button>Start my free audit</button>`;
function serving(changes = {}) {
  return async (url) => {
    if (url.pathname === '/release.json') return changes.manifestResponse ?? Response.json({ commitSha: commit, auditExperience: 'cleaning-business-audit-v1', ...changes.manifest }, { headers });
    if (url.pathname.startsWith('/api/')) return new Response('', { status: changes.apiStatus ?? 405 });
    return new Response(changes.html ?? currentHtml, { headers: changes.headers ?? headers });
  };
}

test('live release verification requires the correct commit, questionnaire pages and API startup', async () => {
  const result = await inspectDeployment({ baseUrl: 'https://example.com', commit, fetchImpl: serving() });
  assert.deepEqual(result.pages, ['/free-audit', '/free-audit-ads']);
  assert.equal(result.commit, commit);
});

test('a successful deployment status cannot make a domain serving an older commit pass', async () => {
  await assert.rejects(inspectDeployment({ baseUrl: 'https://example.com', commit,
    fetchImpl: serving({ manifest: { commitSha: 'b'.repeat(40) } }) }), /Domain is serving commit/);
});

test('old chat markup and wrong page revisions fail even if the release manifest is current', async () => {
  for (const html of [currentHtml + '<textarea id="audit-chat-input"></textarea>', currentHtml.replace(commit, 'b'.repeat(40)), '<h1>Find the jobs you are missing</h1>']) {
    await assert.rejects(inspectDeployment({ baseUrl: 'https://example.com', commit, fetchImpl: serving({ html }) }), /questionnaire|expected deployment/);
  }
});

test('cacheable audit HTML and broken serverless entry points fail the production gate', async () => {
  await assert.rejects(inspectDeployment({ baseUrl: 'https://example.com', commit, fetchImpl: serving({ headers: { 'Cache-Control': 'public, max-age=31536000' } }) }), /cache policy/);
  await assert.rejects(inspectDeployment({ baseUrl: 'https://example.com', commit, fetchImpl: serving({ apiStatus: 500 }) }), /startup check/);
});

test('missing or invalid release manifests cannot silently pass', async () => {
  for (const response of [new Response('', { status: 404 }), new Response('<html>old app</html>')]) {
    await assert.rejects(inspectDeployment({ baseUrl: 'https://example.com', commit, fetchImpl: serving({ manifestResponse: response }) }), /manifest/);
  }
});

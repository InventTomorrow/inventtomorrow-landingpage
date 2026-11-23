import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAudit } from '../../server/audit';
import {
  READINESS_OPTIONS, READINESS_STAGES, calculateReadinessScore, isReadinessStageComplete,
  parseReadinessAnswers, readinessQuestionId, readinessReport, readinessProblems, type ReadinessAnswer,
} from './readinessScorecard';

const allAnswers = (answer: ReadinessAnswer) => Object.fromEntries(READINESS_STAGES.flatMap((stage) =>
  stage.questions.map((_, index) => [readinessQuestionId(stage.id, index), answer])));

test('only the first two question screens are required before the contact screen', () => {
  assert.deepEqual(READINESS_STAGES.map((stage) => stage.id), ['lead-acquisition', 'sales']);
  const complete = allAnswers('Never');
  assert.equal(Object.keys(complete).length, 6);
  for (const id of Object.keys(complete)) {
    const missing = { ...complete };
    delete missing[id];
    assert.equal(parseReadinessAnswers(missing), null);
    assert.equal(parseReadinessAnswers({ ...complete, [id]: 'Occasionally' }), null);
  }
  assert.equal(parseReadinessAnswers(null), null);
  assert.equal(parseReadinessAnswers([]), null);
  assert.equal(isReadinessStageComplete({ 'lead-acquisition-0': 'Never' }, 0), false);
  assert.equal(isReadinessStageComplete(complete, 0), true);
  assert.equal(isReadinessStageComplete(complete, 6), false);
  assert.deepEqual(parseReadinessAnswers({ ...complete, extra: 'ignored' }), complete);
  assert.throws(() => calculateReadinessScore({}), /all 6/);
});

test('all four choices score consistently and percentages use unrounded points', () => {
  for (const [index, answer] of READINESS_OPTIONS.entries()) {
    const result = calculateReadinessScore(allAnswers(answer));
    assert.equal(result.overall, Math.round(index / 3 * 100));
    assert.ok(result.stages.every((stage) => stage.score === result.overall));
  }
  const varied = allAnswers('Never');
  varied['lead-acquisition-0'] = 'Sometimes';
  varied['sales-0'] = 'Always';
  const result = calculateReadinessScore(varied);
  assert.equal(result.stages[0].score, 11);
  assert.equal(result.stages[1].score, 33);
  assert.equal(result.overall, 22);
});

test('priorities only include the remaining stages, ordered by score', () => {
  const answers = allAnswers('Always');
  answers['sales-0'] = 'Never';
  const result = calculateReadinessScore(answers);
  assert.deepEqual(result.opportunities.map((item) => item.id), ['sales', 'lead-acquisition']);
  assert.ok(calculateReadinessScore(allAnswers('Always')).opportunities.every((item) => item.title.startsWith('Keep strengthening')));
  const report = readinessReport(answers, result);
  for (const stage of READINESS_STAGES) for (const question of stage.questions) assert.ok(report.includes(question));
  assert.match(report, /Overall score: 83\/100/);
});

test('the visible preview identifies problems from answers and never presents a solution as a problem', () => {
  const answers = allAnswers('Always');
  answers['sales-1'] = 'Never';
  const problems = readinessProblems(answers, calculateReadinessScore(answers));
  assert.deepEqual(problems, [{ id: 'sales', title: 'Sales', items: ['Call notes and next steps still need to be added to your CRM by hand.'] }]);
  assert.deepEqual(readinessProblems(allAnswers('Always'), calculateReadinessScore(allAnswers('Always'))), []);
});

const request = () => ({
  mode: 'readiness_scorecard', answers: allAnswers('Usually'), name: 'Dana', email: 'dana@example.com',
  businessName: 'Example Team', role: 'Owner', companySize: '1 to 10', pagePath: '/free-audit',
  submissionId: 'scorecard-test-123456789', sessionId: 'scorecard-session-123456789', tracking: { utm_source: 'test' },
});
const env = { GMAIL_AUDIT_REPORTS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret', GMAIL_REFRESH_TOKEN: 'test-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com' };
let requestNumber = 0;


test('readiness scores unlock only after Gmail accepts the scorecard email', async (t) => {
  for (const accepted of [true, false]) {
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
      calls++;
      if (String(url).includes('oauth2.googleapis.com')) return Response.json({ access_token: 'mock-access', token_type: 'Bearer' });
      return accepted ? Response.json({ id: 'accepted' }) : new Response('', { status: 500 });
    });
    const result = await handleAudit({ ...request(), submissionId: 'readiness-gmail-test-' + accepted }, 'scorecard-' + ++requestNumber, env);
    assert.equal(result.status, accepted ? 200 : 502);
    assert.equal(result.body.scorecard?.overall, accepted ? 67 : undefined);
    assert.equal(result.body.reportEmailSent, accepted ? true : undefined);
    assert.equal(calls, 2);
    t.mock.restoreAll();
  }
});

test('invalid readiness answers and contact fields are rejected before contacting Google', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network'); });
  for (const changes of [{ answers: {} }, { email: 'invalid' }, { name: ' ' }, { role: '' }, { companySize: 'other' }, { pagePath: '/unrelated' }]) {
    assert.equal((await handleAudit({ ...request(), ...changes }, 'scorecard-' + ++requestNumber, env)).status, 400);
  }
  assert.equal(mock.mock.callCount(), 0);
  assert.equal((await handleAudit(request(), 'scorecard-' + ++requestNumber, {})).status, 503);
});

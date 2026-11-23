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
const env = { N8N_WEBHOOK_TEST_URL: 'https://webhook.example.test/audit' };
let requestNumber = 0;

test('the scorecard API saves all answers and scores before revealing server-calculated results', async (t) => {
  for (const pagePath of ['/free-audit', '/free-audit-ads']) {
    let payload: any;
    t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, options?: RequestInit) => {
      payload = JSON.parse(String(options?.body));
      return Response.json({ success: true, submission_id: payload.submissionId });
    });
    const result = await handleAudit({ ...request(), pagePath, scorecard: { overall: 100 } }, `scorecard-${++requestNumber}`, env);
    assert.equal(result.status, 200);
    assert.equal(result.body.scorecard?.overall, 67);
    assert.equal(result.body.reportEmailSent, false, 'lead capture alone does not confirm an email');
    assert.equal(payload.event, 'readiness_scorecard_completed');
    assert.equal(payload.source, 'form_data');
    assert.equal(payload.pagePath, pagePath);
    assert.equal(payload.lead.role, 'Owner');
    assert.equal(payload.lead.companySize, '1 to 10');
    assert.equal(payload.utm_source, 'test');
    assert.equal(Object.keys(payload.scorecard.answers).length, 6);
    assert.match(payload.lead.description, /Overall score: 67\/100/);
    assert.match(payload.scorecardEmail.text, /Your priorities/);
    assert.equal(payload.smsConsent.granted, false);
    assert.equal(payload['appointment datetime'], undefined);
    t.mock.restoreAll();
  }
});

test('the sent message requires an explicit email confirmation for this recipient and submission', async (t) => {
  for (const [emailSent, recipient, expected] of [
    [true, 'dana@example.com', true], [true, 'DANA@example.com', true], [true, 'other@example.com', false],
    [false, 'dana@example.com', false], ['true', 'dana@example.com', false],
  ] as const) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({
      success: true, submission_id: request().submissionId, scorecard_email_sent: emailSent, scorecard_email_to: recipient,
    }));
    const result = await handleAudit(request(), `scorecard-${++requestNumber}`, env);
    assert.equal(result.status, 200);
    assert.equal(result.body.reportEmailSent, expected);
    t.mock.restoreAll();
  }
});

test('invalid answers and contact details never reach the webhook', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
  for (const changes of [
    { answers: {} }, { email: 'invalid' }, { name: '  ' }, { role: '' }, { businessName: 'x'.repeat(161) },
    { companySize: 'other' }, { pagePath: '/unrelated' },
  ]) {
    const result = await handleAudit({ ...request(), ...changes }, `scorecard-${++requestNumber}`, env);
    assert.equal(result.status, 400);
    assert.equal(result.body.scorecard, undefined);
  }
  assert.equal(mock.mock.callCount(), 0);
  assert.equal((await handleAudit(request(), `scorecard-${++requestNumber}`, {})).status, 503);
});

test('unconfirmed saves and webhook failures keep scorecard results locked for retry', async (t) => {
  for (const response of [
    () => Response.json({ success: true, submission_id: 'different-submission' }),
    () => Response.json({ success: false }),
    () => new Response('', { status: 200 }),
    () => new Response('unavailable', { status: 500 }),
  ]) {
    t.mock.method(globalThis, 'fetch', async () => response());
    const result = await handleAudit(request(), `scorecard-${++requestNumber}`, env);
    assert.equal(result.status, 502);
    assert.equal(result.body.scorecard, undefined);
    t.mock.restoreAll();
  }
});

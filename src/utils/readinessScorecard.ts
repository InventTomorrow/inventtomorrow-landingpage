export const READINESS_OPTIONS = ['Never', 'Sometimes', 'Usually', 'Always'] as const;
export type ReadinessAnswer = typeof READINESS_OPTIONS[number];
export type ReadinessAnswers = Record<string, ReadinessAnswer>;
export const READINESS_COMPANY_SIZES = ['1 to 10', '11 to 50', '51 to 200', '201 to 500', '501+'] as const;

export const READINESS_STAGES = [
  {
    id: 'lead-acquisition', title: 'Lead acquisition',
    questions: [
      'New leads get a reply within the hour.',
      'Each piece of content is reused across several channels.',
      'Lead details reach your CRM without anyone retyping them.',
    ],
    opportunity: 'Connect your lead capture and first reply',
    recommendation: 'Bring enquiries into your CRM automatically, send a timely first reply, and build a repeatable process for reusing content.',
    maintain: 'Review response times and CRM handoffs regularly, and test which reused content brings the strongest enquiries.',
  },
  {
    id: 'sales', title: 'Sales',
    questions: [
      'Proposals start from a library of your best past work.',
      'Call notes and next steps land in your CRM automatically.',
      'Every lead gets a tailored follow-up, on time.',
    ],
    opportunity: 'Make sales follow-up consistent',
    recommendation: 'Create a shared proposal library, capture call notes in your CRM, and assign a clear next step and follow-up date to every lead.',
    maintain: 'Keep your proposal library current and review follow-up quality as your team and offer change.',
  },
] as const;

export const READINESS_QUESTION_COUNT = READINESS_STAGES.reduce((total, stage) => total + stage.questions.length, 0);

export const readinessQuestionId = (stageId: string, question: number) => `${stageId}-${question}`;

export function isReadinessStageComplete(answers: ReadinessAnswers, stage: number) {
  const section = READINESS_STAGES[stage];
  return !!section && section.questions.every((_, question) =>
    READINESS_OPTIONS.includes(answers[readinessQuestionId(section.id, question)]));
}

export function parseReadinessAnswers(value: unknown): ReadinessAnswers | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const answers: ReadinessAnswers = {};
  for (const stage of READINESS_STAGES) {
    for (let index = 0; index < stage.questions.length; index++) {
      const id = readinessQuestionId(stage.id, index);
      const answer = raw[id];
      if (!READINESS_OPTIONS.includes(answer as ReadinessAnswer)) return null;
      answers[id] = answer as ReadinessAnswer;
    }
  }
  return answers;
}

export interface ReadinessResults {
  overall: number;
  stages: { id: string; title: string; score: number }[];
  opportunities: { id: string; title: string; recommendation: string }[];
}

export interface ReadinessProblem {
  id: string;
  title: string;
  items: string[];
}

const PROBLEM_STATEMENTS: Record<string, readonly string[]> = {
  'lead-acquisition': [
    'New leads are not consistently getting a reply within the hour.',
    'Content is not consistently reused across several channels.',
    'Lead details still need to be retyped into your CRM.',
  ],
  sales: [
    'Proposals do not consistently start from your best past work.',
    'Call notes and next steps still need to be added to your CRM by hand.',
    'Leads are not consistently getting tailored follow-ups on time.',
  ],
};

export function readinessProblems(answers: ReadinessAnswers, results: ReadinessResults): ReadinessProblem[] {
  return results.opportunities.flatMap((opportunity) => {
    const stage = READINESS_STAGES.find((item) => item.id === opportunity.id);
    if (!stage) return [];
    const items = stage.questions.flatMap((_, index) =>
      answers[readinessQuestionId(stage.id, index)] !== 'Always' ? [PROBLEM_STATEMENTS[stage.id][index]] : []);
    return items.length ? [{ id: stage.id, title: stage.title, items }] : [];
  });
}

export function calculateReadinessScore(answers: ReadinessAnswers): ReadinessResults {
  const complete = parseReadinessAnswers(answers);
  if (!complete) throw new Error(`Please answer all ${READINESS_QUESTION_COUNT} questions before viewing your scorecard.`);
  const points = READINESS_STAGES.map((stage) => stage.questions.reduce((sum, _, index) =>
    sum + READINESS_OPTIONS.indexOf(complete[readinessQuestionId(stage.id, index)]), 0));
  const maximumPoints = READINESS_OPTIONS.length - 1;
  const stages = READINESS_STAGES.map((stage, index) => ({ id: stage.id, title: stage.title, score: Math.round(points[index] / (stage.questions.length * maximumPoints) * 100) }));
  const priorities = stages.map((stage, index) => ({ ...stage, index }))
    .sort((a, b) => points[a.index] - points[b.index] || a.index - b.index).slice(0, 3);
  return {
    overall: Math.round(points.reduce((sum, value) => sum + value, 0) / (READINESS_QUESTION_COUNT * maximumPoints) * 100),
    stages,
    opportunities: priorities.map(({ index, score }) => ({
      id: READINESS_STAGES[index].id,
      title: score === 100 ? `Keep strengthening ${READINESS_STAGES[index].title.toLowerCase()}` : READINESS_STAGES[index].opportunity,
      recommendation: score === 100 ? READINESS_STAGES[index].maintain : READINESS_STAGES[index].recommendation,
    })),
  };
}

export function readinessReport(answers: ReadinessAnswers, results: ReadinessResults) {
  return [
    'Invent Tomorrow — AI readiness scorecard', `Overall score: ${results.overall}/100`, '',
    ...READINESS_STAGES.flatMap((stage, index) => [
      `${stage.title}: ${results.stages[index].score}/100`,
      ...stage.questions.map((question, questionIndex) => `${question} ${answers[readinessQuestionId(stage.id, questionIndex)]}`), '',
    ]),
    'Your priorities', ...results.opportunities.map((item) => `${item.title}: ${item.recommendation}`), '',
    'Self-assessment only. Never = 0, Sometimes = 1, Usually = 2, Always = 3. Scores are percentages of the available points.',
  ].join('\n');
}

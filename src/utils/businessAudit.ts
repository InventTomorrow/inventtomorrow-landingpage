export interface BusinessAuditQuestion {
  id: string;
  text: string;
  options: readonly string[];
  maxSelections?: number;
}

export interface BusinessAuditStage {
  id: string;
  title: string;
  questions: readonly BusinessAuditQuestion[];
}

export const BUSINESS_AUDIT_STAGES: readonly BusinessAuditStage[] = [
  {
    id: 'your-business', title: 'Your Business', questions: [
      { id: 'A1', text: 'How many people work in your business, including you?', options: ['Just me', '2 to 3', '4 to 15', '16 or more'] },
      { id: 'A2', text: 'About how many new enquiries (calls, forms, messages) do you get each month?', options: ['Under 20', '20 to 50', '51 to 150', 'More than 150'] },
      { id: 'A3', text: 'Where do most of your new jobs come from?', maxSelections: 2, options: ['Google or Google Maps', 'Referrals', 'Paid ads or lead sites', 'Social media', 'Repeat clients', 'Commercial or contract work'] },
      { id: 'A12', text: 'What do you charge for a standard clean?', options: ['Under $120', '$120 to $180', '$181 to $250', 'Over $250'] },
    ],
  },
  {
    id: 'missed-calls', title: 'Missed Calls & Response Time', questions: [
      { id: 'A5', text: 'In a typical week, how many calls do you miss?', options: ['0 to 2', '3 to 5', '6 to 10', 'More than 10', 'No idea'] },
      { id: 'A6', text: 'When a call is missed, what usually happens?', options: ['We call back within the hour', 'We call back later that day', 'We call back the next day, or when I remember', 'Only if they leave a voicemail'] },
      { id: 'A7', text: 'When a website or after-hours enquiry comes in, how long until someone replies?', options: ['Under 5 minutes', 'Within an hour', 'Same day', 'Next day or later', 'Not sure'] },
      { id: 'A8', text: 'Of the quotes you sent last month, about how many turned into bookings?', options: ['Under 20%', '20 to 40%', '40 to 60%', 'Over 60%', "I don't track it"] },
    ],
  },
  {
    id: 'follow-ups', title: 'Follow-Ups & Unused Leads', questions: [
      { id: 'A9', text: 'When a quote goes quiet, what do you do?', options: ['Nothing', 'One follow-up', 'Two or three follow-ups', 'A set process that runs every time'] },
      { id: 'A10', text: 'Roughly how many old quotes or enquiries are sitting in your system that never booked?', options: ['Under 100', '100 to 200', '200 to 500', 'More than 500', 'No idea'] },
      { id: 'A11', text: 'Have you ever messaged that old list?', options: ['Never', 'Once, and it worked', "Once, and it didn't work", 'We do it regularly'] },
      { id: 'A13', text: 'Of the one-off clients you cleaned last month, how many became regulars?', options: ['Almost none (under 10%)', 'About 10 to 25%', 'About 25 to 50%', 'More than half', "I don't follow up with them"] },
    ],
  },
  {
    id: 'business-value', title: 'Business Value & Readiness', questions: [
      { id: 'E1', text: 'Who would approve the messages, and could they do it within 48 hours?', options: ['Me, yes', "Me, but I'm slow to respond", 'Someone else, yes', 'Not sure'] },
      { id: 'E2', text: 'Can you currently tell which bookings came from which lead?', options: ['Yes, always', 'Sometimes', 'No'] },
      { id: 'E3', text: 'If the numbers look right, what could delay getting started?', options: ["Nothing, I'd start", 'Price', 'I need more trust or proof', 'Timing or too busy right now', "I'd want my partner or team to agree"] },
      { id: 'A17', text: 'If you got 5 extra booked cleans a month without doing anything extra, what would that be worth to you each year?', options: ['Under $5,000', '$5,000 to $10,000', '$10,000 to $20,000', 'Over $20,000'] },
    ],
  },
];

export const BUSINESS_AUDIT_QUESTIONS = BUSINESS_AUDIT_STAGES.flatMap((stage) => stage.questions);
export const BUSINESS_AUDIT_QUESTION_COUNT = BUSINESS_AUDIT_QUESTIONS.length;
export type BusinessAuditAnswer = string | string[];
export type BusinessAuditAnswers = Record<string, BusinessAuditAnswer>;

export const NO_RELIABLE_ESTIMATE = 'No reliable revenue estimate is available from these answers alone. We would need to review actual lead and booking records before putting a number on the opportunity.';

export interface BusinessAuditReport {
  businessName: string;
  bigPicture: string;
  business: { teamSize: string; monthlyEnquiries: string; leadSources: string[]; standardCleanPrice: string; overview: string };
  findings: { heading: string; body: string; evidenceIds: string[] }[];
  whyThisMatters: string;
  illustrativeOpportunity: string;
  nextConversation: string;
}

export function businessAuditReportText(report: BusinessAuditReport) {
  return [
    `CLIENT AUDIT — ${report.businessName}`, '', 'THE BIG PICTURE', report.bigPicture, '', 'YOUR BUSINESS',
    `Team size: ${report.business.teamSize}`, `Monthly enquiries: ${report.business.monthlyEnquiries}`,
    `Main lead sources: ${report.business.leadSources.join(', ')}`, `Standard clean: ${report.business.standardCleanPrice}`,
    report.business.overview, '', 'WHAT YOUR ANSWERS ARE TELLING US',
    ...report.findings.flatMap((finding) => [finding.heading, finding.body, '']),
    'WHY THIS MATTERS', report.whyThisMatters, '', 'ILLUSTRATIVE OPPORTUNITY', report.illustrativeOpportunity,
    '', 'THE NEXT CONVERSATION', report.nextConversation, '', 'Prepared with AI from your audit answers for Invent Tomorrow.',
  ].join('\n');
}

export function isBusinessAuditAnswerValid(question: BusinessAuditQuestion, answer: unknown): answer is BusinessAuditAnswer {
  if (question.maxSelections) {
    return Array.isArray(answer) && answer.length >= 1 && answer.length <= question.maxSelections
      && new Set(answer).size === answer.length
      && answer.every((option) => typeof option === 'string' && question.options.includes(option));
  }
  return typeof answer === 'string' && question.options.includes(answer);
}

export function isBusinessAuditStageComplete(answers: BusinessAuditAnswers, stageIndex: number) {
  const stage = BUSINESS_AUDIT_STAGES[stageIndex];
  return !!stage && stage.questions.every((question) => isBusinessAuditAnswerValid(question, answers[question.id]));
}

export function parseBusinessAuditAnswers(value: unknown): BusinessAuditAnswers | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const answers: BusinessAuditAnswers = {};
  for (const question of BUSINESS_AUDIT_QUESTIONS) {
    const answer = raw[question.id];
    if (!isBusinessAuditAnswerValid(question, answer)) return null;
    // Canonical option order makes retries stable even if checkboxes were selected in a different order.
    answers[question.id] = Array.isArray(answer) ? question.options.filter((option) => answer.includes(option)) : answer;
  }
  return answers;
}

export function businessAuditResponses(answers: BusinessAuditAnswers) {
  const complete = parseBusinessAuditAnswers(answers);
  if (!complete) throw new Error(`Please answer all ${BUSINESS_AUDIT_QUESTION_COUNT} audit questions.`);
  return BUSINESS_AUDIT_QUESTIONS.map((question, index) => ({
    number: index + 1, id: question.id, question: question.text, answer: complete[question.id],
  }));
}

// This is a record of submitted answers for storage, not an AI-generated client report.
export function businessAuditSubmissionText(businessName: string, answers: BusinessAuditAnswers) {
  return [
    'Invent Tomorrow — Cleaning Business Audit Questionnaire', `Business: ${businessName}`, '',
    ...businessAuditResponses(answers).map((response) =>
      `${response.number}. (${response.id}) ${response.question}\n${Array.isArray(response.answer) ? response.answer.join('; ') : response.answer}`),
  ].join('\n\n');
}

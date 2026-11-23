import { pickTracking } from '../src/utils/attribution.ts';
import { sendFormNotification, type GmailEnv } from './gmail.ts';

export async function deliverForm(input: {
  subject: string;
  submissionId: string;
  lead: Record<string, string>;
  pagePath?: string | null;
  details?: Record<string, string>;
  tracking?: unknown;
}, env: GmailEnv) {
  const text = [input.subject, '', `Submission ID: ${input.submissionId}`, `Page: ${input.pagePath || 'Not supplied'}`, '',
    ...Object.entries(input.lead).map(([key, value]) => `${key}: ${value || 'Not supplied'}`), '',
    ...Object.entries(input.details ?? {}).map(([key, value]) => `${key}: ${value}`), '',
    ...Object.entries(pickTracking(input.tracking)).map(([key, value]) => `${key}: ${value}`),
  ].join('\n');
  return sendFormNotification({ subject: input.subject, submissionId: input.submissionId, text,
    ...(input.lead.email ? { replyTo: input.lead.email } : {}),
  }, env);
}

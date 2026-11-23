import { pickTracking } from '../src/utils/attribution.ts';
import { sendFormNotification, type GmailEnv } from './gmail.ts';
import { recordLead, type Defer, type LeadIntegrationEnv } from './leadIntegrations.ts';

export type FormDeliveryEnv = GmailEnv & LeadIntegrationEnv;

export async function deliverForm(input: {
  subject: string;
  submissionId: string;
  lead: Record<string, string>;
  pagePath?: string | null;
  details?: Record<string, string>;
  tracking?: unknown;
}, env: FormDeliveryEnv, defer?: Defer) {
  const text = [input.subject, '', `Submission ID: ${input.submissionId}`, `Page: ${input.pagePath || 'Not supplied'}`, '',
    ...Object.entries(input.lead).map(([key, value]) => `${key}: ${value || 'Not supplied'}`), '',
    ...Object.entries(input.details ?? {}).map(([key, value]) => `${key}: ${value}`), '',
    ...Object.entries(pickTracking(input.tracking)).map(([key, value]) => `${key}: ${value}`),
  ].join('\n');
  const delivery = await sendFormNotification({ subject: input.subject, submissionId: input.submissionId, text,
    ...(input.lead.email ? { replyTo: input.lead.email } : {}),
  }, env);
  await recordLead({ ...input, kind: input.details?.caseStudy ? 'case-study' : 'booking', report: text,
    details: { ...input.details, source: input.details?.caseStudy ? 'case_study_unlock' : input.details?.conversation ? 'chat_handoff' : 'contact_form' },
    emailStatus: delivery.sent ? 'SENT' : delivery.code === 'GMAIL_DISABLED' ? 'DISABLED' : 'FAILED' }, env, defer);
  return delivery;
}

# Cleaning-business audit report agent

The supplied report instructions are saved verbatim in
[`prompts/cleaning-business-audit-system-prompt.md`](prompts/cleaning-business-audit-system-prompt.md).
Server code can import `AUDIT_REPORT_SYSTEM_PROMPT` from
[`server/auditReportPrompt.ts`](../server/auditReportPrompt.ts).
Keep these copies in sync when editing the instructions.

The 16 supplied questions now replace the readiness questionnaire on `/free-audit`
and `/free-audit-ads`. The four stages, original question IDs, wording, and answer
options are maintained in [`src/utils/businessAudit.ts`](../src/utils/businessAudit.ts).
Question A3 accepts one or two distinct lead sources. All other questions accept
one answer. Back/Next navigation retains the selections.

The final contact screen keeps name, work email, business name, and role.
Company size comes from A1 instead of being requested again. The final button is
**Get My Business Audit**. The previous Never/Sometimes/Usually/Always scoring is
not applied to these answers; no replacement scoring rubric has been supplied.

## Submission and capture

The form posts `mode: cleaning_business_audit` to `/api/audit`. The server
validates all 16 answers and the contact fields, then calls KobiLLM with the supplied
report instructions as a system message and a separate JSON data message containing
only the business name and the ordered questions and answers. Contact names,
emails, roles, tracking, and internal data are not sent to the model.

The model returns structured report text. The server requires exactly three
findings with valid question IDs as evidence and rejects missing, empty, malformed,
or truncated reports. It fills the business profile from the submitted answers and
inserts the prompt's no-reliable-estimate paragraph, since no approved calculation
method has been provided. Caller-supplied scores, instructions, or internal
summaries cannot override the system prompt.

On success the API returns `success`, matching `submissionId`, the complete
`report`, `leadSaved`, and `reportEmailSent`. The form displays the big picture,
business profile, and first two findings. The remaining finding and final report
sections appear in a blurred, clipped preview that is inert and excluded from the
accessibility tree. The full-report email notice shows the submitted recipient.
It says sent only when the server confirms delivery; otherwise it shows delivery
awaiting confirmation. The booking and answer-review actions remain available;
there is no on-page full-report download. React renders generated strings as text;
it does not inject model HTML or execute Markdown.

Provider or validation errors retain the form and answers for retry. Identical
requests share an in-flight generation and reuse reports for up to ten minutes in
a bounded per-process cache. The cache is not durable across server restarts or
shared across serverless instances. The model request times out after 75 seconds;
the browser allows 115 seconds and the Vercel function allows 120 seconds.

## Optional n8n capture

Full reports can also be emailed directly by the server through Gmail, without
n8n. See [Gmail setup](gmail-setup.md) for one-time owner authorization, server-only
credentials and deployment settings. When direct Gmail and capture are both
enabled, the updated export uses `businessAuditEmail.delivery: server_gmail` to
save the lead without sending a second n8n email. Import the updated workflow
before enabling both integrations.

On-page reports work without n8n. Enable `N8N_BUSINESS_AUDIT_CAPTURE=true` only
after importing the dedicated capture workflow. Capture then sends the existing
webhook a `source: form_data`, `event: cleaning_business_audit_completed` record
after report generation. The payload includes:

- `lead`: contact details, company size from A1, and all questions and selected
  answers and the generated report in `description`, which the existing sheet
  maps to its message column.
- `businessAudit`: questionnaire version 1, answers keyed by the original IDs,
  and ordered responses containing question number, ID, wording, and answer.
- `auditReportInput`: business name and those ordered audit responses, ready for
  the report agent, plus the generated structured report in `auditReport`.
- `businessAuditEmail`: a fixed subject and the complete plain-text report for
  delivery to the submitted lead email.
- Existing submission/session IDs and allowlisted campaign attribution.

The API requires `success: true`, the matching `submission_id`, and
`business_audit_saved: true` before setting `leadSaved: true`. A generic response
from an older workflow does not confirm capture. Failed capture leaves
`leadSaved: false` and the report preview still displays. Capture/email has a
30-second timeout. The API sets `reportEmailSent: true` only when the response also
has `report_email_sent: true` and `report_email_to` matching the submitted email.
Unchanged retries keep the same submission ID while mounted. No SMS is sent.

Import the inactive [`n8n-business-audit-workflow.json`](n8n-business-audit-workflow.json)
into n8n and verify the inherited sheet connections before activation. It saves
the complete questionnaire in the existing lead message column, then routes these
submissions to the dedicated full-report email branch. It skips emails already
marked `BUSINESS_AUDIT_SENT`, prepares the full report, sends it through the inherited
Gmail connection, records that status, and returns the sent acknowledgement.
Provider/status failures return saved-but-unconfirmed. They bypass the
legacy estimates, appointment email, readiness report email, and SMS delivery.
Other events retain their existing routes. This export has not been applied to
the live account.

To regenerate the export from the patched base workflow, run
`node scripts/patch-business-audit-workflow.mjs`. Optional arguments are the base
workflow export path and destination path. Start from
`docs/n8n-live-workflow.patched.json`, which does not already contain the new
readiness or cleaning-business branches.

## Provider configuration

Set `KOBOILLM_API_KEY` on the server. `KOBOILLM_BASE_URL` defaults to
`https://api.koboillm.com/v1`; the request uses `/chat/completions`, following the
[provider's OpenAI-compatible integration](https://docs.koboillm.com/en/integrasi/).
`KOBOILLM_AUDIT_MODEL` overrides the report model independently; otherwise it uses
`KOBOILLM_MODEL`, defaulting to `gpt-6-luna`.

Local credentials belong in ignored `.env.local`. Production needs these settings
in its deployment environment; changing a local file does not configure Vercel.
Never use a `VITE_` prefix for a secret. Provider response bodies and credentials
are excluded from public errors and logs.

Use the supplied instructions as the system message and submit business answers
as a separate data message. Treat business names and free-text answers as
untrusted data, never as instructions that can override the system message.

Keep supplied internal summaries and scorecards unchanged and out of the
client-facing report. Do not invent a fit score or reuse the legacy quick-audit
revenue assumptions as approved calculations for this new report. Until approved
calculations and sufficient evidence are supplied, use the prompt's prescribed
no-reliable-estimate wording.

## Verification

`src/utils/businessAudit.test.ts` checks every allowed option, required answers,
the lead-source selection limit, API validation, and both page routes. It
executes the exported n8n normalization, sheet mappings, routing condition, and
response expression with mocked network delivery. It also checks that stale or
failed acknowledgements cannot falsely confirm capture, reports work without
n8n, provider failures retain retry, invalid reports are rejected, and concurrent
requests share generation. No real emails or live workflow changes are part of
these tests.

Live generation verification used fictional answers through the configured KobiLLM
model and the local `/api/audit` HTTP endpoint. Preview checks render the actual
React component and verify that only two findings are outside the inert blurred
wrapper, no download is offered, and email status reflects confirmed delivery.
No live report email has been sent by these checks. Interactive browser/visual QA was
unavailable because the browser host and native computer-use pipe were unavailable.

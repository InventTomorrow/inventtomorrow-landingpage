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

## Submission and delivery

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
`report` and `reportEmailSent`. The form displays the big picture,
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

## Direct Gmail delivery

The server sends the complete report directly to the submitted lead using
`sendAuditReportEmail`. See [Gmail setup](gmail-setup.md) for owner authorization,
server-only credentials, the email template and production environment settings.
The email includes a plain-text alternative and the unchanged original hero
image as an inline MIME part. Every generated report section is included.

`reportEmailSent` is true only after Google accepts the message and returns a
message ID. An unconfigured or failed send leaves the report preview available
and its email notice awaiting confirmation. No CRM save is claimed. Browser
contact details and answers remain available for retry.

Gmail token refresh and sending share a 20-second deadline. Confirmed unchanged
retries and concurrent requests share a bounded ten-minute process cache; this
does not guarantee cross-instance exactly-once delivery. No SMS is sent.

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

`src/utils/businessAudit.test.ts` checks allowed options, required answers,
the lead-source selection limit, API validation, both page routes, complete Gmail
report content, failed-send status, malformed provider responses and concurrent
generation. The email and runtime suites check safe MIME encoding, recipient
routing, typed contact validation, and source/compiled API startup.
All automated delivery checks mock the provider and Google; they send no real mail.

# Free audit pages and agent prompts

The supplied workflow is now implemented in the combined [synced n8n export](n8n-free-audit-workflow.json). Follow [its import/setup guide](n8n-free-audit-setup.md) for the required sheet headers, response contract, delivery settings and verification limits.

Both `/free-audit` and `/free-audit-ads` use the same page and chat. The ads page retains its logo-only header, no navigation/footer, and `noindex` status.

## Website behavior

- Invo identifies itself as Invent Tomorrow's AI assistant. The hero, chat and booking modal describe a free 15-minute audit. The existing `/contact` form keeps its current behavior.
- “Book my free audit” starts four questions: business name, missed calls per week, old quotes, and typical clean price. Range answers are buttons; business name is typed. Visitors can ask questions before starting.
- The fourth answer opens a form for email, phone, website (or “No website yet”) and company size. Closing it keeps the typed fields and locks/blurs the whole chat. “Get my audit” reopens it. Escape and keyboard focus are handled by the modal.
- The API validates the form, calculates the estimates, and sends one lead record to the configured n8n webhook. Results unlock only after n8n saves the record and returns the matching submission ID and estimates. Empty/default 2xx responses are rejected. On failure, the form stays available, results remain locked, and retries retain the submission ID, including across reloads when browser storage is available.
- The code uses the document's representative values, 4.3 weeks/month, a 20% assumed missed-call booking rate, a 9% quote revival rate, and rounding to $50. Old quote revival is a one-off estimate. Unknown old quotes produce no revival estimate. The 15-minute call checks actual counts and guarantee eligibility.
- “Talk to a person” and “Book my 15-minute call” open the existing appointment form with a 15-minute label. The team confirms availability; the site does not claim an appointment is confirmed. Email links use `/free-audit?book=1` to open this form directly.

## Agent prompts

The maintained prompts are in [`server/auditPrompts.ts`](../server/auditPrompts.ts):

- `INVO_SYSTEM_PROMPT`: public AI identity, approved services and pricing, 15-minute audit, guarantee terms, and no invented results or contact capture in chat.
- `AUDIT_EMAIL_SYSTEM_PROMPT`: plain-text audit email, using server-calculated numbers only. The server also selects the larger opportunity for the subject so the agent does not compare or calculate amounts.

For n8n, copy the plain-text [audit email system prompt](prompts/audit-email-system-prompt.md) into the email-writing agent. Email sending stays in n8n.

The website chat defaults to `gpt-6-luna` through the existing provider, with `reasoning_effort=none` and a 1,200-token response budget. The prompt has no fixed word/sentence limit, and replies retain their full text and formatting. The first four quick replies use maintained predefined answers in `src/utils/freeAudit.ts`; “Book my free audit” starts the guided questions. The other three explain missed calls, quiet quotes and repeat bookings without a model request. Email length is controlled separately by the email-writing prompt. Explicit `KOBOILLM_MODEL` overrides remain supported.

Founding availability is `FOUNDING_SPOTS_LEFT` in [`src/utils/freeAudit.ts`](../src/utils/freeAudit.ts). The homepage, stats, both audit pages, pricing answer and email-agent data use it. Regenerate/reimport the workflow after changing it.

## Required n8n connection

Import the combined [n8n-free-audit-workflow.json](n8n-free-audit-workflow.json) and follow [its setup guide](n8n-free-audit-setup.md). It already includes both form events, chat history, explicit saved-submission acknowledgements, fixed email instructions, and consent-gated SMS handoff. The guide lists required headers/settings, retry limitations and the live checks still needed.

## Verification

Run npm run build:vercel. Runtime tests mock external services; workflow tests execute the exported Code nodes and response expressions for all 100 answer combinations. Unit tests cover calculations, draft and ID recovery, and invalid stored results. The build verifies both pages and the ads route isolation. Browser access is unavailable in this session; live n8n email/SMS delivery remains unverified.

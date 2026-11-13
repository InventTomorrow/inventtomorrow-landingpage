# Synced free-audit workflow

## Live workflow (read this first)

The workflow actually running in n8n is **"Invent Tomorrow — Audit Email (chat, form, fallback)"**, exported to [n8n-live-workflow.json](n8n-live-workflow.json). The website is tested against it in `scripts/n8n-live-contract.test.mjs`. The rest of this page describes `n8n-free-audit-workflow.json`, a replacement that was never deployed.

[n8n-live-workflow.patched.json](n8n-live-workflow.patched.json) is the live workflow with these fixes, built by `npm run patch:live-workflow`. Email nodes are unchanged.

- Saves the lead **before** telling the website it was saved. A failed save now returns an error, so the visitor's results stay locked and they can retry.
- Saves the full record: website, company size, the four answers, both estimates, guarantee, page, visitor session, event, all UTM and click IDs, and SMS consent.
- Fills the chat sheet's `Contact Detials` column (it was always blank because of a key mismatch).
- The Slack alert includes the whole audit. A new **SMS Payload (connect your provider)** node prepares the consented text but does not send it.

To apply it:

1. In n8n, open the live workflow and download a backup (⋯ → Download).
2. In the `form-bookings-data` tab, add these header columns, spelled exactly: `Website, Company Size, Missed Calls Answer, Missed Calls per Month, Missed Call Value, Old Quotes Answer, Old Quotes Number, Revival Value, Typical Clean Answer, Guarantee Status, Audit Complete, Page Path, Visitor Session ID, Event, UTM Source, UTM Medium, UTM Campaign, UTM Term, UTM Content, UTM ID, GCLID, FBCLID, MSCLKID, SMS Consent`.
3. In the open live workflow, choose ⋯ → Import from File → `n8n-live-workflow.patched.json`. Reconnect credentials if asked, then Save. The webhook path stays the same.
4. Connect your SMS provider node (Twilio etc.) to **SMS Payload (connect your provider)**.
5. If you change the live workflow in n8n, export it over `n8n-live-workflow.json` and run `npm run patch:live-workflow && npm test`.

Estimates must match exactly. Monthly missed calls are **whole numbers** (weekly × 4.3, rounded: 13, 43, 99, 151), and dollar values come from that number, rounded to $50. This matches the live `Structure Fields2` node. The website rejects any n8n reply whose numbers differ.

Email settings in the live `Structure Fields2` (`bookingLink`, `foundingSpotsLeft`, `founderName`) are blank, so emails fall back to "reply to this email" with no P.S. These belong to n8n's email setup and are not changed by the patch.

## Maintained replacement (not deployed)

`Free Audit.md` is the content/calculation specification. The supplied `InventTomorrow_Workflow_Fresh.json` is the source workflow. Its maintained replacement is [n8n-free-audit-workflow.json](n8n-free-audit-workflow.json), combining audit leads, appointment requests, customer emails, optional Abdul Hadi alerts and versioned chat history. It is exported **inactive**. Local edits do not change live n8n.

## Import and configure

Back up the shared live workflow before replacing it. Use this combined export, not the chat-only export, and keep only one active workflow on the existing webhook path.

1. Reconnect the Google Sheets, Gmail and OpenAI credentials. The export retains existing names/document IDs but contains no credential secrets.
2. Open **Structure Fields** and edit `SETTINGS`. Founder name defaults to **Abdul Hadi**, from the website's Founder & CEO listing. The booking URL opens the site's existing 15-minute appointment form. Hardcode Abdul Hadi's real `teamAlertEmail` as requested; blank disables alerts. Supply your genuine `businessMailingAddress` and `unsubscribeLink`. Audit emails record a delivery error until these footer settings are present.
3. Add/confirm the exact sheet headers below and refresh the Google Sheets nodes' schemas.
4. Connect **SMS Payload (connect your provider)** to your existing n8n SMS branch. It outputs a consented quick-audit text with booking link, consent text/time and an idempotency key. **It does not send a text itself.** Honor the idempotency key and STOP handling in your provider branch. Appointment requests do not invent SMS consent.
5. Monitor **Delivery Failure** and its **Record Delivery Failure** sheet update. Delivery error outputs keep a failed email from blocking the optional team/SMS branches. Lead-save failures stop before acknowledgement. The website cannot report failures after acknowledgement.
6. Activate the production workflow. Local/Preview uses `N8N_WEBHOOK_TEST_URL` unless `N8N_USE_PRODUCTION=true`; production uses `N8N_WEBHOOK_URL`. A test webhook needs n8n to be listening.

Email within one minute and SMS within five minutes require a live check in your configured n8n/provider account. No live leads, emails or SMS were sent during local verification.

## Customer journey and contract

Both audit routes use the specified copy, AI identity, four questions, pricing response and results. The ads route retains its logo-only header, no navigation/footer, and `noindex` status.

Answer four opens the email/phone/website/company-size form automatically. Closing it blurs and disables the chat. “Get my audit” restores the same draft; fields and submission ID also survive reloads when browser storage is available, scoped to the browser, page and answers.

The API validates the form, calculates estimates and sends `source=form_data`, `event=quick_audit_completed`. n8n validates/calculates the same figures, upserts one lead, and **then** acknowledges it. Only after a matching acknowledgement does the API return the n8n results to the chat, close the popup and lift the blur. Empty/default HTTP 200 responses, invalid JSON, explicit failure, wrong submission ID, incomplete audit and mismatching estimates leave results locked. Retry uses the same submission ID.

The webhook has an eight-second website timeout. After saving, return:

```json
{
  "success": true,
  "audit_complete": true,
  "submission_id": "the-submitted-id",
  "audit": {
    "business_name": "Bright Home Cleaning",
    "missed_calls_month": 43,
    "missed_call_value": 1300,
    "old_quotes_number": 125,
    "revival_value": 1700,
    "guarantee_status": "close",
    "estimates_are_rough": true
  }
}
```

The API maps the snake-case webhook results to the UI's camel-case fields and checks they match the specification. Monthly calls are whole numbers (13, 43, 99, 151), matching the live workflow; dollar estimates round to $50. Unknown old quotes return **null** count/value, and that result/email line is omitted. Old quote revival is a one-off opportunity, not monthly income.

“Talk to a person” and “Book my 15-minute call” open the existing appointment form. The preferred time is subject to team confirmation. Email booking links use `https://www.inventtomorrow.pro/free-audit?book=1`. Appointment submissions, including `/contact`, require `success: true` and the matching `submission_id`; the export also returns `audit_complete: false, audit: null`. Chat returns `success: true, saved: true` after writing or skipping an existing version.

## Data and sheet headers

The form record includes all four answers, four contact fields, both estimates, guarantee status, page, timestamp and allowlisted tracking: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `gclid`, `fbclid`, `msclkid`. The server assigns the source/event. The email writer uses a fixed maintained system prompt and normalized fields; visitor data never becomes instructions.

In the form sheet, legacy **Session ID means submission ID** (upsert/email key). **Visitor Session ID** separately correlates the browser with chat. The chat sheet retains its browser Session ID and matches **Conversation ID** (`sessionId:pagePath`).

Form sheet headers, exact spelling:

```text
Session ID, Visitor Session ID, Event, Name, Bussiness Name, Email, Phone_Number,
Appointment_dateTime, Submition_datetime, Appointment_message, Website, Company Size,
Missed Calls Answer, Missed Calls per Month, Missed Call Value, Old Quotes Answer,
Old Quotes Number, Revival Value, Typical Clean Answer, Guarantee Status,
Audit Complete, Page Path, UTM Source, UTM Medium, UTM Campaign, UTM Term,
UTM Content, UTM ID, GCLID, FBCLID, MSCLKID, SMS Consent, SMS Consent Text,
SMS Consent At, Email Content, Email Status, Delivery Error
```

Chat sheet headers:

```text
Session ID, Conversation ID, Version, Page, Event ID, Last Updated,
Contact Detials, Main Concern, Lead Captured, Asked To Book Directly, Chat
```

The original chat sheet used trailing tabs in two headers: rename them to `Last Updated` and `Main Concern` without tabs. `Contact Detials` preserves its original spelling. RAW cell formatting preserves user-entered text. Keep the existing QStash FIFO configuration for serial chat read/version-check/write operations.

## Email and retries

### Local form returns HTTP 502

The local dev response includes `X-Chat-Webhook` (`test`/`production`) and `X-Audit-Error`. The JSON response also includes the same safe `code`; detailed status/acknowledgement checks appear in the server terminal without contact data, raw n8n bodies or webhook URLs.

| Code | What to check |
| --- | --- |
| `WEBHOOK_NOT_REGISTERED` | n8n returned 404. For `test`, open the intended Webhook node and click **Listen for test event**, then submit while it is listening. Test listeners are temporary; a chat logging request can consume the waiting test event before the form. For continuous testing, deliberately use an active/published production webhook with `N8N_USE_PRODUCTION=true` and restart Vite. Verify the path matches the workflow. |
| `WEBHOOK_HTTP_ERROR` | n8n returned a non-2xx status. Check the execution and its failing node; check authentication for 401/403. |
| `WEBHOOK_TIMEOUT` / `WEBHOOK_NETWORK_ERROR` | Check connectivity and that the lead-save/respond path finishes within eight seconds. |
| `WEBHOOK_INVALID_RESPONSE` | n8n sent an empty or non-JSON response. Set Webhook Respond to **Using Respond to Webhook Node** and run the form's response node after saving. |
| `WEBHOOK_ACK_MISMATCH` | JSON arrived but `success` was not true or `submission_id` did not match. Return the documented contract from Structure Fields. |
| `WEBHOOK_AUDIT_MISMATCH` | The saved quick-audit acknowledgement omitted or changed calculated results. Import/update the synced workflow calculations. |

Do not replace a failed acknowledgement with unconditional success: the visitor must be told whether their lead was saved. The test URL must be listening even when the workflow's production URL is active. n8n documents the distinction in its [Webhook guide](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/).

The [email prompt](prompts/audit-email-system-prompt.md) follows the supplied document, with the larger subject opportunity preselected so the writer never calculates. The parser checks `SUBJECT:`/`BODY:`, subject length, 150–220 words, allowed dollar estimates, the rough-estimates disclaimer, booking URL and founder signature. The sending tool adds the actual postal address/unsubscribe link and sends **plain text**.

Upserts preserve `Email Status`; sequential retries skip an already `SENT` email. Google Sheets is not an atomic messaging ledger: concurrent retries or Gmail success followed by a failed status write can still duplicate an email. Check execution/provider status before replaying an uncertain delivery. Strict exactly-once messaging requires a transactional ledger or provider idempotency; the SMS branch must honor its prepared idempotency key.

## Maintenance and verification

`FOUNDING_SPOTS_LEFT` in `src/utils/freeAudit.ts` now feeds the homepage, stats, audit pages, pricing and email. After changing availability/prompts, run `npm run sync:audit-workflow`, then `npm run build:vercel`. The sync script updates the export and email prompt copy. **Regeneration resets fixed settings; reapply your live email/footer settings and SMS connections when importing again.** It never edits live n8n. To adapt a fresh export, run `node scripts/sync-audit-workflow.mjs path/to/export.json`.

Tests mock external services, exercise failed acknowledgements and reload restoration, execute the real export's Code/response expressions, and compare all 100 estimate combinations through the API. The build checks audit metadata and ads-page isolation. Interactive browser QA is unavailable in this session because the browser host/native pipe cannot be reached; live credentials and email/SMS timing remain unverified.

The save-before-response arrangement follows n8n's [Respond to Webhook behavior](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/). Matching/mapping follows [the Google Sheets node documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/).

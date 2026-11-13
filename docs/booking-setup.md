# Audit requests and the shared n8n webhook

The supplied workflow now has a [synced combined export](n8n-free-audit-workflow.json). Follow [its setup guide](n8n-free-audit-setup.md) when importing it. Both appointment and quick-audit forms require n8n to return `success: true` and a `submission_id` matching the submitted ID after the Sheet write; a generic 2xx no longer confirms a saved lead.

On `/free-audit` and `/free-audit-ads`, “Book my free audit” starts the four-question quick audit and its results form. “Talk to a person” and “Book a 15-minute call” open the appointment form without navigating away. Existing booking links to `/contact#book-or-message` still lead to the appointment form on the contact page. Calendly is no longer part of the website flow. The visitor chooses a preferred appointment date and time; the team confirms availability.

This document covers the existing appointment submissions. The quick audit uses `source=form_data`, `event=quick_audit_completed` and a separate payload without an appointment. See [free audit setup](free-audit-setup.md) for that payload, agent prompts and required n8n routing.

The form collects full name, business name, email, a valid US phone number, one required combined appointment datetime field, a US time zone, and an optional description. The forms use US Eastern Time (`America/New_York`), regardless of the visitor's location or browser setting. The time-zone field is hidden and still sent in the webhook payload. The API also defaults to Eastern Time if the zone is omitted and rejects zones outside that list. The browser posts to `/api/audit`, which validates the input and sends only the form details to n8n. Invalid datetimes or zones, and past appointments in the selected US zone are rejected. No model API key is needed for the form, and no chat messages are included.

The datetime selector uses an inline month calendar and 30-minute time buttons with 12-hour labels. It supports keyboard navigation and filters past days/times using the selected US zone. Time choices are preferences for team confirmation, not live calendar availability. The selected value still posts as one `appointment datetime` field; the custom UI does not add a scheduling service or change the webhook payload.

Chat continues through `/api/chat` on both audit pages. The first visitor message is captured before the AI request, even if the AI fails or the visitor leaves. Every reply produces another transcript snapshot. Partial logging defaults to enabled; `N8N_LOG_EVERY_MESSAGE=false` opts out. With `QSTASH_TOKEN`, chat snapshots and completed chat requests wait for durable FIFO queue acceptance; QStash delivers to n8n and retries independently of the browser. Without it, chat waits for direct n8n acceptance. Form submissions still wait for direct n8n acceptance. See [chat logging setup](chat-logging.md) for activation and failure/reload behavior.

## Destination

Both APIs use the same server-only environment settings:

- Production (`VERCEL_ENV=production`) or `N8N_USE_PRODUCTION=true`: `N8N_WEBHOOK_URL`.
- Local and Preview by default: `N8N_WEBHOOK_TEST_URL`.

The production workflow must be active. A test webhook must be listening for a test event. Missing webhook configuration prevents request submission; the form shows an error rather than a success message. Webhook rejection or timeout also leaves the form available to retry.

## Route by source in n8n

After the existing Webhook node, add a Switch using `{{ $json.body.source }}`:

| Source | Handler |
| --- | --- |
| `invo_chat` | Chat history and chat audit requests |
| `form_data` | Audit form submissions |

If a prior node has already unwrapped `body`, use `{{ $json.source }}` instead.

Chat payloads retain `sessionId`, `timestamp`, `lead`, `leadCaptured`, `askedToBookDirectly`, and `transcript`. They also include `pagePath`, `version` (transcript message count), and a stable `eventId` for retries. The `event` is `message` for partial chats and `audit_request` for completed requests. Use `sessionId` together with `pagePath` to update a chat's existing record and reject equal/older versions. Log-only recovery always uses `event=message` and never repeats an audit submission.

Form payload example:

```json
{
  "source": "form_data",
  "event": "audit_request",
  "submissionId": "4ed9f3c8-e908-4f64-bfd4-5a67aebcfdb8",
  "sessionId": "73026043-f4d5-4335-8f55-2d0b14f5f974",
  "timestamp": "2026-11-11T12:00:00.000Z",
  "pagePath": "/free-audit-ads",
  "appointment datetime": "2026-11-12T14:30",
  "appointmentTimeZone": "America/New_York",
  "lead": {
    "name": "Alex Morgan",
    "businessName": "Bright Home Cleaning",
    "email": "alex@example.com",
    "phone": "+12022345678",
    "description": "Help with missed calls and quote follow ups"
  },
  "leadCaptured": true
}
```

The combined field is named exactly `appointment datetime` at the top level, with a value in `YYYY-MM-DDTHH:mm` format (24-hour time). `appointmentTimeZone` stays separate (for example `America/New_York`). Interpret the datetime in that zone; it is not implicitly UTC. In n8n, access the combined value as `{{ $json.body['appointment datetime'] }}` and the zone as `{{ $json.body.appointmentTimeZone }}`. Separate `appointmentDate` and `appointmentTime` fields are no longer sent.

All chat, booking form and quick-audit webhook payloads include `sessionId`. Browser startup creates or restores the ID on the first visit to any page, before chat or forms mount. The browser keeps one ID in component/session state and `localStorage` under `invo-session:v1`, reusing it across pages, reloads and browser restarts without an expiry or scheduled rotation. Existing saved chat IDs are adopted on upgrade. This identifies one browser profile on one site origin; clearing site data, using private browsing or changing browsers/devices can create a new ID. If storage is blocked, the ID is shared in memory for the current page lifetime. The API generates a fallback ID when older clients omit it or supply an invalid value.

The form payload has no `transcript`, `messages`, or `askedToBookDirectly`. The server assigns `source` rather than trusting a value supplied by the browser. A retry from the same form keeps `submissionId`; use it as an upsert/deduplication key if the first response was interrupted after n8n received the request. `sessionId` links that request to the visitor's chat; it is not a submission deduplication key or an authentication credential.

`docs/n8n-chat-history-workflow.json` is the chat-only workflow export with a version guard and acknowledgement after the Sheet write. Add `Version`, `Page`, `Event ID`, and `Conversation ID` columns to the chat sheet, and route by source before its chat processing nodes. Match chat rows on `Conversation ID` (`sessionId:pagePath`) so the same browser's separate page histories cannot overwrite each other. Keep `Session ID` unchanged to correlate forms and chats. Preserve the existing `form_data` branch; replacing the entire shared workflow with this chat-only export would remove form handling. The website changes do not modify live n8n.

## Verification

Run `npm run build:vercel`. Runtime tests mock the provider and webhook, covering source separation, both environment destinations, input validation, delivery failures, rate limiting, and native/compiled API startup. They do not send test leads to the live webhook.

After deployment, verify the form and chat once against the intended n8n environment and confirm each reaches the correct Switch branch. Runtime environment changes require redeployment.

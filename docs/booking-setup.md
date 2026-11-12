# Audit requests and the shared n8n webhook

The audit buttons on `/free-audit` and `/free-audit-ads` open the audit form without navigating away. Existing booking links to `/contact#book-or-message` lead to the same form on the contact page. Calendly is no longer part of the website flow. The visitor chooses a preferred appointment date and time; the team confirms availability.

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

Chat payloads retain `sessionId`, `timestamp`, `lead`, `leadCaptured`, `askedToBookDirectly`, and `transcript`. They also include `pagePath`, `version` (transcript message count), and a stable `eventId` for retries. The `event` is `message` for partial chats and `audit_request` for completed requests. Use `sessionId` to update a chat's existing record and reject equal/older versions. Log-only recovery always uses `event=message` and never repeats an audit submission.

Form payload example:

```json
{
  "source": "form_data",
  "event": "audit_request",
  "submissionId": "4ed9f3c8-e908-4f64-bfd4-5a67aebcfdb8",
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

The form payload has no `transcript`, `messages`, `sessionId`, or `askedToBookDirectly`. The server assigns `source` rather than trusting a value supplied by the browser. A retry from the same form keeps `submissionId`; use it as an upsert/deduplication key if the first response was interrupted after n8n received the request.

`docs/n8n-chat-history-workflow.json` is the chat-only workflow export with a version guard and acknowledgement after the Sheet write. Add `Version`, `Page`, and `Event ID` columns to the chat sheet, and route by source before its chat processing nodes. Preserve the existing `form_data` branch; replacing the entire shared workflow with this chat-only export would remove form handling. The website changes do not modify live n8n.

## Verification

Run `npm run build:vercel`. Runtime tests mock the provider and webhook, covering source separation, both environment destinations, input validation, delivery failures, rate limiting, and native/compiled API startup. They do not send test leads to the live webhook.

After deployment, verify the form and chat once against the intended n8n environment and confirm each reaches the correct Switch branch. Runtime environment changes require redeployment.

# Gmail delivery for full audit reports

For spreadsheet logging and Slack alerts after Gmail, see
[lead integrations setup](lead-integrations-setup.md). Sheets uses its own
refresh token; reconnecting it does not replace the Gmail token.

The cleaning-business audit can send its complete report directly through the
Gmail API. Only the owner authorizes a sending mailbox; visitors do not sign in
with Google. The existing `/api/audit` endpoint validates the questionnaire,
generates the report, and emails the complete report in the supplied HTML design,
with a plain-text alternative, to the submitted lead address. No general-purpose
email endpoint is exposed.

## Report email design

`server/auditEmail.ts` renders the business profile, all three findings and every
remaining report section dynamically. It adapts the supplied
`semester-smart-tools.html` design with the exact website accent `#2077BC`,
numbered finding cards, and links to the site's existing free-call booking flow.
All business and model text is escaped; long content expands instead of being
clipped. Table layout and inline styles support email clients, with mobile styles
for smaller screens.

Typography matches the site: **Outfit** for headings and finding numbers, and
**DM Sans** for paragraphs, buttons and labels. Supported clients load the same
self-hosted WOFF2 files from the website. Clients that block custom fonts use
Arial/Helvetica; classic Outlook has an explicit fallback to avoid Times New Roman.
See the [email font support table](https://www.caniemail.com/features/css-at-font-face/).
Standalone previews embed the local font files so they also work offline.

The email reuses the unchanged first-section landing-page image,
`public/images/hero-cleaning-automation.jpg`, behind the header text and booking
button, like the website's opening section. The left side has a light gradient
for readable navy/blue text; the original JPEG remains unchanged. Outlook receives
a VML background fallback. There is no separate image row below the heading.
Gmail attaches the original JPEG inline with a matching Content-ID, so the HTML does not depend
on a hosted image URL or an unsupported data URI. The editable blue header,
buttons and numbering use the website blue. Vercel explicitly packages the JPEG
with the audit function.

Run `npm run preview:audit-email` to generate standalone local previews in
`output/audit-email/preview.html` and `preview-long.html`. These contain fictional
sample reports and embed the unchanged image for browser viewing. The preview
command sends no email.

## Connect the sender once

1. In [Google Cloud Console](https://console.cloud.google.com/), select/create a
   project and enable **Gmail API**.
2. Configure the Google Auth platform consent screen, audience and data access.
   Add `https://www.googleapis.com/auth/gmail.send` as the sole requested scope.
   If the app is in Testing, add the sending Google account as a test user.
3. Create an OAuth client of type **Web application**, with this exact authorized
   redirect URI: `http://127.0.0.1:53682/oauth/google/callback`.
   This loopback callback is for the owner's local setup command.
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to the ignored `.env.local`.
   Set `GMAIL_SENDER_EMAIL` to the mailbox you will authorize (or a verified
   send-as alias already configured in that Gmail account).
5. From the repository root, run `npm run connect:gmail`. Open the printed Google
   authorization URL on the same computer, select the sending account and approve
   sending permission. The command waits up to five minutes on loopback only.
6. The command saves `GMAIL_REFRESH_TOKEN` in `.env.local`, retaining other
   configuration. Tokens are not printed. Then set
   `GMAIL_AUDIT_REPORTS_ENABLED=true` and restart the development server.

Authorization uses a random state and PKCE challenge. The setup command does not
send a test message or change deployment settings. Never commit real credentials,
paste tokens into chat, or add a `VITE_` prefix to these settings.

For an external consent screen in **Testing**, Google's Gmail refresh tokens
normally expire after seven days. Configure the appropriate production/internal
audience and complete any verification Google requires for the deployment before
relying on unattended sending. See Google's
[token expiration rules](https://developers.google.com/identity/protocols/oauth2#expiration)
and [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).

## Deploy

Add all five server settings to the intended Vercel environment and redeploy:

For this repository, the existing live project is **inventtomorrow-cleaning** in
the **abdulhadi806s-projects** Vercel team, serving `www.inventtomorrow.pro`.
The similarly named `pro-dev7/inventtomorrow` project is a different site.
Import the private `.env.production.local` file into the correct project's
**Production** environment before deploying. Local env files do not update
Vercel automatically. The upload exclusions keep these files out of source
deployments; do not commit or upload them as application assets.

| Variable | Value |
| --- | --- |
| `GMAIL_AUDIT_REPORTS_ENABLED` | `true` |
| `GOOGLE_CLIENT_ID` | OAuth client ID from the connected project |
| `GOOGLE_CLIENT_SECRET` | Matching OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Saved by the connection command |
| `GMAIL_SENDER_EMAIL` | Authorized mailbox or verified send-as alias |

The existing `KOBOILLM_API_KEY` is still needed to generate audit reports. Gmail
sends reports directly. Leave sending disabled in Preview/Development unless you intend
those environments to email submitted addresses. Setting the enable flag to
`false` turns off direct delivery. To revoke access, remove the app's Google
account permission and remove its refresh token from the deployment settings.

## Contact and team notifications

Contact requests, case-study unlocks and completed chat booking handoffs notify
the team directly through Gmail. Set `GMAIL_FORM_NOTIFICATIONS_ENABLED=true`
to enable them. If the flag is omitted it follows
`GMAIL_AUDIT_REPORTS_ENABLED`; an explicit `false` disables team notifications.
The ignored production env file has team notifications enabled.

`GMAIL_NOTIFICATION_EMAIL` optionally selects the team inbox and defaults to
`GMAIL_SENDER_EMAIL`. It is never read from a public request. The submitted
visitor email becomes the Reply-To header. Notifications contain contact details,
submission ID, relevant form data and allowlisted campaign tags. Chat handoffs
include recent conversation context; ordinary messages remain browser-local.

Forms acknowledge receipt only after Google accepts the notification. Appointment
times remain requests for the team to confirm, not automatic calendar bookings.
The legacy quick-audit and readiness modes email their results directly to leads.

Old hosted workflow/queue settings are ignored by the application and can be
deleted from Vercel. They have already been removed from the local env files.

## Delivery behavior and verification

Each send refreshes a Google access token and posts a UTF-8 multipart MIME message
(plain text, HTML and the related inline image) to
[`users.messages.send`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send).
Both calls share a 20-second deadline. `reportEmailSent` becomes true only after
Google returns a message ID.
This means provider acceptance, not a guarantee of inbox placement. A failed or
unconfigured send leaves the report preview available and the existing email
notice awaiting confirmation; logs contain a safe error code, not credentials or
recipient details. There is no separate lead-storage acknowledgement.

Unchanged concurrent requests and confirmed sends share a bounded ten-minute
process cache keyed by sender, credentials, recipient, submission ID and report.
Failures may be retried. This is not a durable queue or cross-instance exactly-once
delivery: a restart, a different serverless instance, a new submission ID, or a
timeout after Google accepts a message can cause a repeated send. No automatic
retry is made after an ambiguous send failure.

Run `npm run lint` and `npm test`. Tests mock Google and the AI provider, checking OAuth state,
PKCE, secret-safe failures, MIME encoding, matching inline image bytes, safe dynamic
HTML, full-report content, duplicate requests, and team-notification routing.
For a live check after configuration, complete an audit
using an address you control and verify the Gmail Sent folder and recipient inbox.
Automated checks do not send live mail.

References: [Google web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server),
[creating and sending messages](https://developers.google.com/workspace/gmail/api/guides/sending).

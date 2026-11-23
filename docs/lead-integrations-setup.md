# Google Sheets and Slack lead delivery

The app calls Google Sheets and Slack directly. The workflow export is a field
mapping reference; it is not imported or executed. Gmail continues sending the
existing report and team notification emails.

After Gmail finishes, the server saves the lead and its email status to Sheets,
then posts a team alert to Slack. When email fails or is disabled, the sheet and
alert record that status accurately. Sheet and Slack failures do not turn a
successful report or email into a failed visitor submission.
Valid audit leads are also recorded if the AI report cannot be generated;
`Report Status=FAILED` distinguishes them from generated reports.

## 1. Connect Google Sheets

Use the same Google Cloud project and OAuth web client already configured for
Gmail. Enable the **Google Sheets API**. Add the Sheets scope
`https://www.googleapis.com/auth/spreadsheets` to the consent screen's data access
settings. In Testing mode, add the Google account as a test user.

The Sheets permission can edit spreadsheets accessible to the authorizing
account; it is not restricted by Google to one workbook. This app only uses the
server-configured spreadsheet ID. Give the account Editor access to that file.
Visitors never connect their Google accounts.

Keep the existing authorized redirect URI:

```text
http://127.0.0.1:53682/oauth/google/callback
```

Set these values in `.env.local`:

```dotenv
GOOGLE_SHEETS_ENABLED=false
GOOGLE_SHEETS_SPREADSHEET_ID=1E98eYWwEOoICQUb7N8uUdwZ7Ao-_mKXey3jmP2muk5Y
```

That is the workbook ID from the supplied export. Change it to use a different
workbook. Retain `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then run:

```sh
npm run connect:sheets
```

Open the printed consent URL, sign in to the account with Editor access, and
approve Sheets access. The local script uses state checking, PKCE and offline
access, and saves `GOOGLE_SHEETS_REFRESH_TOKEN` without printing it. It leaves
`GMAIL_REFRESH_TOKEN` unchanged. The existing Gmail-only token cannot access
Sheets. Do not run the two consent commands simultaneously: they share a local
callback port. The authorization command sends no email, sheet rows or Slack
messages.

Prepare the workbook explicitly:

```sh
npm run setup:sheets
```

This command creates missing tabs and appends missing column headers to row 1.
It retains existing rows and columns, and detects duplicate header names. Do not
sort or edit the workbook while running setup. It does not add sample leads or
send messages. After setup succeeds, set `GOOGLE_SHEETS_ENABLED=true`.

Default tabs (override their names with the corresponding server env setting):

| Submission | Tab | Matching key | Stored information |
| --- | --- | --- | --- |
| Full reports and legacy audits | `audit-reports` | Submission ID | Contact details, all answers, full plain-text report, email status, attribution, Slack acknowledgement |
| Contact forms and chat booking handoffs | `form-bookings-data` | Session ID | Original booking columns, requested time and time zone, recent chat context when supplied, team email status |
| Case-study unlocks | `Casestudy-Leads-sheet` | Submission ID | Original lead columns, case study, attribution, team email status |

The historical `Bussiness Name` and `Submition_datetime` column
names are retained. Trailing whitespace on old header names is accepted. Report
content goes into `Email Content`; email status is `SENT`, `FAILED`, or `DISABLED`.
`SENT` means Gmail accepted the message, not that it reached the recipient inbox.
Cells are sent with `valueInputOption=RAW` so visitor text cannot execute as a
spreadsheet formula. Individual cells are limited to 45,000 characters.

## 2. Connect Slack

Create or use a Slack app in the workspace that owns the destination channel.
Under **OAuth & Permissions**, grant the bot **chat:write**, install/reinstall
the app, and invite the bot to the channel. Use the Bot User OAuth Token in the
server environment; do not copy it into chat or a browser-visible setting.

The export used `#all-ai-team`, channel ID `C0BKF5AM5L1`. Configure:

```dotenv
SLACK_LEAD_ALERTS_ENABLED=true
SLACK_BOT_TOKEN=your-private-bot-token
SLACK_CHANNEL_ID=C0BKF5AM5L1
```

Both Sheets and Slack flags must be enabled. Alerts are posted only after a
sheet row is saved. They include lead details, case study or requested appointment
where applicable, email status, submission ID and workbook link. They use plain
text blocks so visitor text cannot trigger Slack mentions. Chat
conversations are not logged to Sheets and do not post alerts. Setup does not
create a chat-history tab.

## 3. Production

Add the Google Sheets settings, Sheets refresh token, and Slack settings to the
**Production** environment of **inventtomorrow-cleaning** in
**abdulhadi806s-projects**, alongside the existing Gmail and AI settings. Optional
tab overrides must match the workbook prepared in step 1. Redeploy after updating
environment variables. Local env files do not update Vercel. Never prefix these
settings with `VITE_` or commit real env files.

Vercel retains the integration task with `waitUntil`; the visitor can receive a
response while it finishes. Tasks have an 18-second network deadline after they
start. Both integration flags default to disabled, so existing deployments can
continue sending Gmail without these new credentials.

External apps in Google's OAuth Testing mode can receive refresh tokens that
expire after seven days. Set the consent app's production status appropriately
and complete any Google verification required for its requested scopes.

## Verification and recovery

`GET /api/audit` returns HTTP 405 with a safe `X-Sheets-Configuration` header:
`disabled` means the deployed function has not received `GOOGLE_SHEETS_ENABLED=true`;
`incomplete` means a required Google/Sheets setting is missing or the spreadsheet
ID is invalid; `configured` means required settings are present (Google access and
writes can still fail). This exposes no credentials or lead details. Add the
settings to the correct project's Production environment and redeploy; editing
env values does not update an already running deployment.

Run `npm run check:sheets:production` for a private, read-only live check. It
authenticates with a short-lived HMAC signed using the Google client secret in
`.env.production.local` (the secret is never sent), compares the deployed Sheets
configuration, and checks Google access plus required headers. Unsigned, altered
or expired requests receive HTTP 401 before any Google requests. The check does
not send email or write rows.

`npm run build:vercel` tests delivery using mocked services and sends no real
mail, sheet rows or Slack messages. For a live verification, submit one report
with an address you control and check the corresponding row, email status, full
report and Slack alert. Setup does not perform this live submission for you.

Inspect Vercel logs for `[lead-integrations] Delivery unconfirmed` if a step
fails. Logs contain safe error codes rather than provider response bodies,
credentials or lead data. `SHEETS_SCHEMA_MISMATCH` means run setup/check headers;
`SHEETS_PERMISSION_DENIED` means grant the authorized account Editor access;
`SHEETS_API_DISABLED` means enable Google Sheets API in the OAuth client's project;
`SHEETS_AUTH_FAILED` means reconnect Sheets; `SLACK_SEND_FAILED` means check the
bot scope, channel membership, token and Slack API availability. A missing bot
token/channel produces `SLACK_NOT_CONFIGURED`. `Slack Status=PENDING` means no
durable Slack acknowledgement was saved; verify the channel before resending.

Sequential submissions with the same ID update their existing row. A saved
Slack Message ID suppresses later alerts for that row. Writes are serialized
inside each server process, but Sheets does not provide a cross-instance unique
constraint. Concurrent first submissions on different instances can create
duplicate rows, and a Slack post followed by a failed acknowledgement write can
be posted again on retry. This integration has no scheduled retry queue or
exactly-once guarantee; failed tasks require operator review/retry. Gmail keeps
its existing short-lived in-process send deduplication.

API references: [Sheets append](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append),
[Sheets update](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/update),
[Google scopes](https://developers.google.com/workspace/sheets/api/scopes), and
[Slack chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage/).

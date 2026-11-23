# Invent Tomorrow

React and Vite website with 35 prerendered pages, an AI assistant at `/api/chat`,
and report and contact submissions at `/api/audit`. Gmail handles email directly.

`/free-audit` and `/free-audit-ads` use the 16-question cleaning-business audit.
KobiLLM generates the personalized report; two findings display on the page and
the complete report is emailed to the submitted lead. The ads page has a logo-only
header, no navigation/footer, and `noindex`; it is excluded from site discovery.

See the [report-agent guide](docs/cleaning-business-audit-agent.md) and
[Gmail setup](docs/gmail-setup.md). Direct Google Sheets logging and Slack lead
alerts are covered in [lead integrations setup](docs/lead-integrations-setup.md).

## Run locally

1. Install Node.js 24 LTS and run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `KOBOILLM_API_KEY`.
3. Configure Google OAuth credentials, then run `npm run connect:gmail`.
4. Set the sending mailbox and enable Gmail reports and form notifications.
5. Run `npm run dev` and open `http://localhost:3000`.

Vite serves both APIs during development. Credentials never enter the client
bundle. Provider and report-model overrides are documented in `.env.example`.

## Email and forms

Full audit reports use the styled HTML email and a plain-text alternative.
Run `npm run preview:audit-email` for standalone sample previews.

Contact requests, case-study unlocks and completed chat booking handoffs notify
the team through Gmail. `GMAIL_NOTIFICATION_EMAIL` selects the team inbox;
otherwise notifications go to `GMAIL_SENDER_EMAIL`. The visitor email is the
Reply-To address and cannot override the notification recipient. Forms report
success only after Gmail accepts the message. Appointment times remain requests
for the team to confirm.

Chat conversations are not logged to Google Sheets. Only a completed booking
handoff sends relevant details and recent context to the team. Invalid details
and failed email delivery retain retry.

Optional Sheets logging saves leads, complete audit answers/reports and email
status. Slack alerts follow successful sheet writes. Authorize Sheets with
`npm run connect:sheets`, prepare the workbook with `npm run setup:sheets`, then
configure the flags and private Slack bot settings. These integrations run in
the background on Vercel; see the setup guide for failure and retry limits.

The business report preview remains available if email is disabled or delivery
cannot be confirmed. Its email notice says sent only after Gmail accepts the
message. The API does not claim that a separate CRM lead was saved.

## Deploy to Vercel

Use the existing **inventtomorrow-cleaning** project in
**abdulhadi806s-projects**, serving `www.inventtomorrow.pro`.

| Setting | Value |
| --- | --- |
| Root Directory | `.` |
| Framework Preset | Vite |
| Node.js | 24.x |
| Install Command | `npm ci` |
| Build Command | `npm run build:vercel` |
| Output Directory | `dist` |

Import private `.env.production.local` into the project's **Production**
environment before deploying. Configure `KOBOILLM_API_KEY`, the Google client
ID/secret, Gmail refresh token, sending mailbox, and the enabled email flags.
See [Gmail setup](docs/gmail-setup.md). Local files do not update a hosted
deployment. Redeploy after changing runtime values. Keep sending disabled in
environments that should not email leads.

Retired workflow and queue variables can be removed from existing hosted
environment settings; the app no longer reads them.

`api/chat.ts` allows 60 seconds and `api/audit.ts` allows 120 seconds. Shared
server code lives in `server/`. The audit function includes the original hero
JPEG for inline email delivery. Font headers allow supported email clients to
fetch the same self-hosted fonts as the site.

Both APIs require server functions; uploading only `dist` to a static host is
insufficient. Each route has prerendered HTML; retain the routing settings and
custom 404 instead of adding a catch-all rewrite to `/index.html`.

`.vercelignore` excludes credentials, local output, dependencies and generated
build files. Keep real env files out of Git. Deploy the source and let Vercel run
the build; do not use `npm ci --omit=dev` for the deployment build.

## Verification and assets

Release with `bash release-safe.sh` from Git Bash. The script safely commits,
tests, pushes and merges the release, waits for the intended Vercel project, then
checks the exact commit on `https://www.inventtomorrow.pro`. A green GitHub status
alone is insufficient: both live audit routes must show the 16-question
questionnaire and both API entry points must start correctly. If the live domain
still points to an older build, the release stops instead of claiming success.

Every build emits `release.json` and matching commit metadata in the page HTML.
The home page, audit pages and release manifest use `no-store` so a new page load
does not reuse an old document. Versioned assets keep their immutable caching.
A tab already open before deployment can retain its loaded app until refreshed.
To recheck a previously pushed release without creating a new commit, run
`bash release-safe.sh --verify-production`.

Run `npm run build:vercel` for TypeScript checks, tests, the Vite build,
prerendering and deployment-artifact verification. Tests mock Google and the AI
provider and send no real emails. Runtime checks verify source and compiled API
imports in plain Node.

After deployment, load `/free-audit`, `/free-audit-ads`, `/contact` and a case-study
URL directly. Unknown URLs should return 404 and `GET /api/chat` should return 405.
Use an address you control for an explicitly authorized live email test.

DM Sans and Outfit are self-hosted under `public/fonts` with their licenses.
Responsive WebP copies of large images live in `public/images/optimized`.
Run `npm run optimize:images` after replacing originals and include the generated
assets and manifest changes. The build checks image references, page metadata,
navigation, sitemap, `llms.txt` and startup guarantees.

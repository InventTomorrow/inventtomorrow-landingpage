# Invent Tomorrow

React and Vite website with 35 prerendered pages, an audit chatbot at `/api/chat`, and an audit request form at `/api/audit`.

The ad landing page is available directly at `/free-audit-ads`. It shares the
`/free-audit` chat, request form and responsive layout, with a logo-only header.
It has no site navigation or footer, is marked `noindex`, and is omitted
from the sitemap and `llms.txt`.

## Run locally

1. Install Node.js 24 LTS and run `npm ci`.
2. Copy `.env.example` to `.env.local` if you do not already have a local env file.
3. Set `KOBOILLM_API_KEY` in `.env.local`.
4. Run `npm run dev` and open `http://localhost:3000`.

The Vite development server serves both APIs locally. Gemini credentials and
`APP_URL` are not used by this app.

## Deploy to Vercel

Import this repository into Vercel, or use the existing Vercel project connected
to it. Set the **Root Directory** to the repository root (`.`).

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Node.js Version | 24.x, enforced by `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run build:vercel` |
| Output Directory | `dist` |

The included `vercel.json` sets the install, build and output settings. The Vercel
build runs both TypeScript checks, all tests, the Vite build, prerendering, and
verification of the generated HTML and SEO files. It needs the development
dependencies, so do not override installation with `npm ci --omit=dev`.

Each public route has its own HTML in `dist`, including case studies and blog
posts. Vercel serves these files directly; keep the current routing configuration
so direct visits retain their page-specific metadata. There is deliberately no
catch-all rewrite to `/index.html`. Unknown URLs use `404.html`; legacy audit and
case-study URLs retain their permanent redirects.

`api/chat.ts` and `api/audit.ts` are the function entry points. Shared logic is in
`server/`, outside the API route directory. Chat has a 60-second maximum duration;
the form has 15 seconds and waits for n8n acceptance before reporting success.
The TypeScript configuration uses Node's module rules and explicit file
extensions. `scripts/chat-runtime.test.mjs` verifies both source and compiled
function startup in plain Node.

Both audit pages capture the first submitted visitor message before calling the
AI, then save the assistant reply. The transcript and stable session ID survive
reloads, and pending logs retry without repeating an AI call or audit submission.
Vercel's `waitUntil` retains the whole request if the browser disconnects.
With `QSTASH_TOKEN`, logs are accepted into a durable FIFO queue and delivered to
n8n independently of the browser, with retries. Without it, the API waits for
direct n8n acceptance; failures remain pending locally until the visitor returns.
The chat waits for queue/direct acceptance, so direct n8n/Sheets latency affects
reply time. Only audit completion may need an extra model extraction call.
The `Server-Timing` response header reports chat response time.

Before deploying, open **Project Settings > Environment Variables** and import the
private `.env.production.local` file into the **Production** environment, if that
file has been prepared locally. Otherwise, enter the values below manually.
Local env files are ignored by Git and do not configure Vercel's runtime by
themselves.

| Variable | Production value |
| --- | --- |
| `KOBOILLM_API_KEY` | Your existing provider API key; required for chat. |
| `KOBOILLM_BASE_URL` | `https://api.koboillm.com/v1`, unless using a provider override. |
| `KOBOILLM_MODEL` | `gpt-4.1-mini`, unless using a model override. |
| `N8N_WEBHOOK_URL` | The shared n8n production webhook for chat history and audit forms; required for audit submissions. |
| `N8N_LOG_EVERY_MESSAGE` | Defaults to enabled; `false` explicitly disables partial chat logs. |
| `QSTASH_TOKEN` | Enables durable chat delivery/retries after the browser closes; no separate database. |
| `QSTASH_URL` | QStash API origin from your account; defaults to `https://qstash.upstash.io`. |
| `N8N_USE_PRODUCTION` | `true` in the production import file to select the production webhook explicitly. |

Keep `N8N_WEBHOOK_TEST_URL` out of the Production environment. For **Preview** and
**Development**, add the provider key separately, use `N8N_WEBHOOK_TEST_URL` only
if testing logging, and set `N8N_USE_PRODUCTION=false`. Do not import the production
env file into Preview or Development. Leave both webhook URLs empty to disable
history logging; chat can answer questions without n8n, but audit requests cannot be submitted.
The n8n workflow must be active for its production webhook to receive events.

All keys and webhook URLs stay on the server; do not prefix them with `VITE_`.
Keep real env files out of Git. Deploy after importing the variables, or redeploy
if updating variables on an existing deployment.

Before enabling the queue, update n8n to acknowledge after its Sheet write and
apply the version guard described in [chat logging setup](docs/chat-logging.md).
The local workflow export is provided for import; it does not update live n8n.

Both APIs need their Vercel Functions; uploading only `dist` to a static host will
not run them. Webhook payloads and source routing are documented in
[docs/booking-setup.md](docs/booking-setup.md).

`.vercelignore` limits CLI source uploads to the application, tests, scripts,
public assets and build configuration. Real env files, dependencies, generated
output and local scratch files stay excluded. If adding a new top-level directory
that the build needs, include it in that file.

## Image delivery

Team portraits and the large homepage/About illustrations use responsive WebP
copies in `public/images/optimized`. Original photos stay unchanged. Run
`npm run optimize:images` after replacing an original image; include the generated
images and `src/content/optimizedImages.ts` in the same change. Filenames contain
content hashes, so Vercel can cache them for a year without hiding photo updates.
The deployment build checks that every referenced image variant exists.

## Verify

Production HTML shows the first screen immediately, without a forced loading
overlay. Routes load on demand and are prefetched only when a visitor hovers or
focuses a navigation link. The homepage's lower sections are a separate chunk,
but all their text still appears in prerendered HTML. Each page preloads only its
own route and static dependencies from Vite's build manifest.

DM Sans and Outfit are self-hosted under `public/fonts`, with their licenses.
Desktop scroll easing loads during idle time; touch devices keep native scrolling.
The build checks these startup guarantees. See the
[performance audit](docs/performance-audit.md) for measurements and verification limits.

```sh
npm run build:vercel
```

The individual `npm run lint`, `npm test` and `npm run build` commands are also
available.

After a Preview deployment, check `/about`, `/free-audit` and a case-study URL
directly, then reload each. Confirm that an unknown URL returns HTTP 404.
`GET /api/chat` should return HTTP 405, not 500; a 500 before any conversation
indicates a function startup/configuration problem to inspect in Vercel's logs.
Test the chat through name, business name, email, phone and audit request confirmation.
Submit the form on `/contact` and open it from both audit pages. In n8n, route
`body.source === "invo_chat"` and `body.source === "form_data"` to their respective handlers.
A deployment without the provider key returns a controlled 503 for chat requests.
Local checks use mocked webhooks and do not verify the deployed API or live n8n
delivery. Production must be redeployed after changing runtime environment values.

References: [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables),
[Node.js versions on Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions),
[Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js),
[Vite environment variables](https://vite.dev/guide/env-and-mode).

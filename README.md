# Invent Tomorrow

React and Vite website with a server-side audit chatbot at `/api/chat`.

## Run locally

1. Install Node.js 24 LTS and run `npm ci`.
2. Copy `.env.example` to `.env.local` if you do not already have a local env file.
3. Set `KOBOILLM_API_KEY` in `.env.local`.
4. Run `npm run dev` and open `http://localhost:3000`.

The Vite development server serves the chat API locally. Gemini credentials and
`APP_URL` are not used by this app.

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` sets the Vite
framework, `npm ci`, `npm run build`, the `dist` output directory, and SPA routing.
Use Node.js 24 LTS in the project's build settings.

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
| `N8N_WEBHOOK_URL` | Your active n8n production URL containing `/webhook/`; optional for chat-history logging. |
| `N8N_LOG_EVERY_MESSAGE` | `true` to save partial conversations as well as completed leads. |
| `N8N_USE_PRODUCTION` | `true` in the production import file to select the production webhook explicitly. |

Keep `N8N_WEBHOOK_TEST_URL` out of the Production environment. For Preview or
Development environments, configure the test URL and set `N8N_USE_PRODUCTION=false`
unless you intentionally want those environments to update the production sheet.
The n8n workflow must be active for its production webhook to receive events.

All keys and webhook URLs stay on the server; do not prefix them with `VITE_`.
Keep real env files out of Git. Deploy after importing the variables, or redeploy
if updating variables on an existing deployment.

The chatbot needs the Vercel Function in `api/chat.ts`; uploading only `dist` to a
static host will not run it. Calendly setup is documented in
[docs/booking-setup.md](docs/booking-setup.md).

## Verify

```sh
npm run lint
npm test
npm run build
```

After deployment, check a direct page URL such as `/about`, then check the audit
chat and its calendar handoff. Local checks do not verify the deployed API,
Calendly account settings, or n8n delivery.

References: [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables),
[Vite environment variables](https://vite.dev/guide/env-and-mode).

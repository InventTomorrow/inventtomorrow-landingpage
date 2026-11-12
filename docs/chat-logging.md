# First-message chat logging

Both `/free-audit` and `/free-audit-ads` use the same logging implementation.
Logging starts with the first **submitted** visitor message. It does not wait for
two messages, an inactivity timer, contact details, or a successful AI reply.

## Delivery without a separate database

1. The browser saves the conversation and session ID to local storage immediately
   before posting to `/api/chat`. Each page has its own saved conversation.
2. The API captures the visitor's transcript before calling the model. With
   `QSTASH_TOKEN`, it awaits durable FIFO queue acceptance. Without it, it awaits
   direct n8n acceptance. A failed capture is reported as pending, not saved.
3. After the model replies, another snapshot includes that reply. Normal logging
   does not require a second model call; partial names/concern summaries can be
   extracted downstream from the saved transcript. Completed audit requests still
   include the validated lead details.
4. Vercel retains the entire request with `waitUntil`, including when the visitor
   disconnects. Once QStash accepts a job, n8n delivery and retries no longer need
   the browser or Vercel request. QStash uses three retries with exponential backoff.
5. Pending browser logs retry shortly after reload, on reconnect, and every 30
   seconds while the page remains open. Recovery uses `mode: "log"`: it never
   calls the AI or repeats an audit request. Only acknowledged snapshots clear
   the pending flag; an older response cannot clear a newer pending snapshot.

Small browser requests use `keepalive` to improve delivery during navigation or
close. This is an extra precaution, not the durable queue. A message that never
reaches either the API/queue or n8n cannot be recovered remotely after the browser
closes; its local copy retries on a future visit. Storage restrictions, clearing
browser data, and permanently failed queue jobs also limit recovery.

## Activate durable delivery

1. Use a QStash account; no MongoDB or Redis database is needed. Copy its token and
   API URL into Vercel's server-only `QSTASH_TOKEN` and `QSTASH_URL` settings. Use
   the URL shown in that account (the default is `https://qstash.upstash.io`). Do
   not put these values in client variables or commit the token.
2. Create/verify the FIFO queue `invo-chat-production` with parallelism **1**.
   Development/Preview uses `invo-chat-test` unless `N8N_USE_PRODUCTION=true`.
   Separate the environments; don't send Preview traffic to the production queue.
3. Keep the existing `N8N_WEBHOOK_URL`/`N8N_WEBHOOK_TEST_URL` routing. QStash must
   reach the selected public webhook. Production n8n must be active; test n8n
   must be listening. Queue authorization is not forwarded to n8n.
4. Add `Version`, `Page`, and `Event ID` columns to the existing chat-history Sheet.
   Update the **chat branch** using `n8n-chat-history-workflow.json`, retaining the
   shared workflow's `source` Switch and existing `form_data` handling. The added
   read/version gate skips equal or older snapshots before writing; matching on
   `Session ID` keeps one row per conversation. Sheet nodes retry transient errors.
5. Set the shared Webhook to **When Last Node Finishes** (the export uses
   `responseMode: "lastNode"`). Leave errors as errors, with a non-2xx response.
   Returning 200 before storage succeeds prevents QStash from detecting failures.
6. Redeploy the website after setting the environment variables. Verify the first
   visitor-only snapshot appears even when the next AI request fails or the tab
   closes. Then verify the reply extends the same row and older retries do not
   shorten the transcript. Verify an audit form still reaches its own branch.

Keep parallelism at 1: a Sheet read/version check plus update is not an atomic
database transaction. FIFO delivery and responding only after the write are what
serialize these operations. Monitor QStash's dead-letter queue and retry exhausted
jobs after correcting n8n failures; durable acceptance is not proof of Sheet write.
Do not trigger lead follow-up actions again for a duplicate `eventId`.

With no QStash token, direct sending still captures the first message and retries
transient delivery errors once inside the request. It does **not** provide durable
background retries beyond that request after the visitor closes the browser.

References: [QStash queues](https://upstash.com/docs/qstash/features/queues),
[deduplication window](https://upstash.com/docs/qstash/features/deduplication),
[enqueue API](https://upstash.com/docs/qstash/api-reference/messages/enqueue-a-message),
[n8n Webhook responses](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/).

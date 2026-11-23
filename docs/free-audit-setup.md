# Audit and chat setup

The current `/free-audit` and `/free-audit-ads` experience is the 16-question
cleaning-business audit. See [the report-agent guide](cleaning-business-audit-agent.md)
and [Gmail setup](gmail-setup.md).

The retained chat API uses `KOBOILLM_API_KEY` with optional provider/model overrides.
Greetings and common questions use local canned answers. Other questions use the
configured AI provider. Guided chat cannot submit booking tools; the validated
forms handle those requests. Chat history persists only in the visitor's browser.

For legacy clients, completed chat booking handoffs email the team through Gmail
only after verifying that contact details appeared in the visitor's own messages.
The reply confirms receipt only after Google accepts the notification. The team
mailbox and sending configuration are shared with contact forms.

The legacy quick-audit mode still validates the original four answers and computes
rough estimates on the server. It emails those estimates directly to the submitted
lead before returning them. The retained readiness-scorecard mode similarly emails
the calculated scorecard before confirming success. Neither mode creates SMS or
calendar bookings.

Use `npm run build:vercel` to verify both APIs and the production artifacts.

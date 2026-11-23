# Legacy readiness scorecard

The main audit pages now use the [cleaning-business audit](cleaning-business-audit-agent.md).
The readiness calculation and API mode remain for compatibility with existing
clients. Six validated answers produce server-calculated stage and overall scores;
the caller cannot supply or override the returned score.

`POST /api/audit` with `mode: readiness_scorecard` requires the answers, name,
business name, work email, role, valid company size and an allowed audit page path.
The server emails the plain-text scorecard directly through Gmail. Results are
returned only after Google accepts the email. Invalid data, unconfigured sending
and delivery errors preserve retry. No phone, SMS or appointment is required.

See [Gmail setup](gmail-setup.md) for sender authorization and deployment settings.

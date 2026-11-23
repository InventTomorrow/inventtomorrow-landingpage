# Contact and appointment requests

`AuditForm` posts contact details and the requested date, time and time zone to
`POST /api/audit`. Name, business name, email, a valid US phone and a valid future
appointment time are required. The time zone defaults to `America/New_York`.

The server validates the request and emails the configured team mailbox through
Gmail. Notifications include the submitted details, requested appointment,
submission ID and allowlisted campaign attribution. The visitor email is Reply-To.
The form confirms receipt only after Gmail accepts the notification. It does not
reserve a calendar event; the team confirms the time separately.

`GMAIL_FORM_NOTIFICATIONS_ENABLED` controls these messages. If omitted, it follows
`GMAIL_AUDIT_REPORTS_ENABLED`. `GMAIL_NOTIFICATION_EMAIL` defaults to the authorized
`GMAIL_SENDER_EMAIL` mailbox. See [Gmail setup](gmail-setup.md).

Case-study unlocks use the same notification settings, require contact details
and a valid case-study slug, and reveal the case study only after the notification
is accepted. They do not request an appointment or send SMS.

The client retains its submission ID for retries. The email sender coalesces
unchanged concurrent requests and confirmed retries within a bounded ten-minute
process cache. This is not durable, cross-instance exactly-once delivery.

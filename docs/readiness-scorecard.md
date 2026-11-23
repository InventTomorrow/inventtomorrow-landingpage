# AI readiness scorecard

This documents the legacy readiness flow. The public audit pages now use the
[16-question cleaning-business questionnaire](cleaning-business-audit-agent.md).
The older API mode remains available for compatibility with existing integrations.

The free audit CTA opens three screens in the original single-column card layout: lead acquisition (three questions), sales (three questions), and contact details. The later onboarding, delivery, retention, and operations question screens have been removed. Back/Next navigation retains answers. The existing site header is retained. The `?book=1` link continues to open the separate 15-minute appointment form.

Each of the six questions uses Never (0), Sometimes (1), Usually (2), or Always (3). Stage scores are percentages of 9 available points; the overall score is a percentage of 18 available points. Only the two completed stages are scored and prioritised. Scores are self-assessments, not revenue estimates.

## Capture and results

The last step posts `mode: readiness_scorecard` to `/api/audit`. The server validates all six answers and contact fields, recalculates results, and sends the record to the existing configured n8n webhook. It reveals results only after receiving `success: true` with the matching `submission_id`. A retry with unchanged details keeps the same submission ID. No phone number, SMS opt-in, or appointment is collected by this flow.

The webhook payload uses `source: form_data` and `event: readiness_scorecard_completed`. It contains:

- `lead`: name, businessName, email, role, companySize, and the complete report in description.
- `scorecard`: version, all six answers, overall score, two stage scores, and their priorities.
- `scorecardEmail`: a ready-to-send subject and plain-text report.
- Existing session ID, submission ID, and campaign attribution fields.

After confirmed capture, the site shows a single compact results card. The first two priority stages show every identified problem in full, arranged side by side on desktop and stacked on phones. A report-shaped preview below contains the remaining findings, stage score bars, and recommended next steps, all blurred and excluded from the accessibility tree. Questions answered Always are excluded. The email status, review action, and call link are inside the same card. Short desktop screens use a shallower report preview. There is no on-page report download.

The sent message requires an acknowledgement with `scorecard_email_sent: true`, the matching `submission_id`, and `scorecard_email_to` matching the submitted email. A saved lead alone does not count as a sent report. Until that confirmation is available, the preview shows delivery as awaiting confirmation.

The readiness submission allows 30 seconds for the webhook to save and send the full report; the browser allows 45 seconds. Other audit/chat webhook calls retain their existing eight-second timeout.

## Full report email workflow

`docs/n8n-readiness-email-workflow.json` is an inactive, importable copy of the existing patched workflow with a dedicated full-report email branch. Generate it with `node scripts/patch-readiness-email-workflow.mjs`; pass a current workflow export as the first argument when adapting a newer export.

The branch saves the lead first, checks the row for `Email Status: READINESS_SENT`, sends `scorecardEmail.subject` and `scorecardEmail.text` through a copy of the existing Gmail node, records READINESS_SENT, and then returns the sent acknowledgement. Completed retries skip a second send. Gmail/status failures return a saved-but-not-confirmed response. Scorecard submissions bypass the legacy cleaning-audit email and SMS branches. Other form events retain their existing route.

Import the generated workflow into n8n, verify the inherited Google Sheets and Gmail credential connections, and activate it for the configured webhook. The repository contains webhook URLs but no n8n management credential, so this local change does not update or activate the live account. No real emails were sent during verification.

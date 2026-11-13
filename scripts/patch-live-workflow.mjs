// Patch the LIVE n8n export so it stores the full Free Audit record and only
// acknowledges after saving. Email nodes are left exactly as exported.
//   node scripts/patch-live-workflow.mjs [input.json] [output.json]
// Defaults: docs/n8n-live-workflow.json -> docs/n8n-live-workflow.patched.json
// This never contacts n8n. Import the output into n8n yourself, after a backup.
import fs from 'node:fs';

const input = process.argv[2] || new URL('../docs/n8n-live-workflow.json', import.meta.url);
const output = process.argv[3] || new URL('../docs/n8n-live-workflow.patched.json', import.meta.url);
const workflow = JSON.parse(fs.readFileSync(input, 'utf8'));

const node = (name) => {
  const found = workflow.nodes.find((n) => n.name === name);
  if (!found) throw new Error(`Missing node: ${name}`);
  return found;
};
const edge = (name) => ({ node: name, type: 'main', index: 0 });
const connect = (from, ...branches) => { workflow.connections[from] = { main: branches.map((names) => names.map(edge)) }; };
// Every text edit must find its anchor, so a changed export fails loudly instead of half-patching.
function replaceOnce(text, anchor, replacement, label) {
  if (text.includes(replacement)) return text; // already patched
  const at = text.indexOf(anchor);
  if (at === -1 || text.indexOf(anchor, at + anchor.length) !== -1) throw new Error(`Anchor not found exactly once: ${label}`);
  return text.slice(0, at) + replacement + text.slice(at + anchor.length);
}

// ---------------------------------------------------------------------------
// 1. Structure Fields2: read tracking in both shapes, keep consent, and build the
//    sheet row and team alert from values this node already calculated.
// ---------------------------------------------------------------------------
const fields = node('Structure Fields2');
let code = fields.parameters.jsCode;
code = replaceOnce(code,
  "  utm_source:get(p.utm_source,p.utm?.source),\n  utm_medium:get(p.utm_medium,p.utm?.medium),\n  utm_campaign:get(p.utm_campaign,p.utm?.campaign),\n",
  "  utm_source:track('utm_source') || get(p.utm?.source),\n  utm_medium:track('utm_medium') || get(p.utm?.medium),\n  utm_campaign:track('utm_campaign') || get(p.utm?.campaign),\n"
  + "  utm_term:track('utm_term'), utm_content:track('utm_content'), utm_id:track('utm_id'),\n"
  + "  gclid:track('gclid'), fbclid:track('fbclid'), msclkid:track('msclkid'),\n"
  + "  event:get(p.event), sms_consent:smsConsent, sms_consent_text:smsConsent ? get(p.smsConsent.text) : '',\n"
  + "  sheet:sheetRow, team_alert_text:teamAlert,\n",
  'Structure Fields2 UTM lines');
code = replaceOnce(code,
  '// Audit delivery is validated AFTER the lead is saved.\n',
  `// Website payload: tracking arrives as p.utm_source and p.tracking.utm_source.
const track = k => get(p[k], p.tracking && p.tracking[k]);
const smsConsent = Boolean(p.smsConsent && p.smsConsent.granted === true);
const blankIfNull = v => v === null || v === undefined ? '' : v;
// One full record per submission, as Free Audit.md requires. Estimates are numbers.
const sheetRow = {
  'Website': website, 'Company Size': companySize,
  'Missed Calls Answer': missedAnswer, 'Missed Calls per Month': auditCompleted ? blankIfNull(missedMonth) : '',
  'Missed Call Value': auditCompleted ? blankIfNull(missedValue) : '',
  'Old Quotes Answer': oldAnswer, 'Old Quotes Number': auditCompleted ? blankIfNull(oldCount) : '',
  'Revival Value': auditCompleted ? blankIfNull(revivalValue) : '',
  'Typical Clean Answer': typicalAnswer, 'Guarantee Status': auditCompleted ? guarantee : '',
  'Audit Complete': auditCompleted ? 'Yes' : 'No', 'Page Path': get(p.pagePath, '/free-audit'),
  'Visitor Session ID': get(p.sessionId), 'Event': get(p.event),
  'UTM Source': track('utm_source') || get(p.utm?.source), 'UTM Medium': track('utm_medium') || get(p.utm?.medium),
  'UTM Campaign': track('utm_campaign') || get(p.utm?.campaign), 'UTM Term': track('utm_term'),
  'UTM Content': track('utm_content'), 'UTM ID': track('utm_id'),
  'GCLID': track('gclid'), 'FBCLID': track('fbclid'), 'MSCLKID': track('msclkid'),
  'SMS Consent': smsConsent ? 'Yes' : 'No',
};
const ad = ['utm_source', 'utm_medium', 'utm_campaign'].map(track).filter(Boolean).join(' / ');
const teamAlert = [
  auditCompleted ? 'New quick audit lead' : 'New audit call request',
  'Name: ' + (name || '-'), 'Business: ' + (business || '-'), 'Email: ' + email, 'Phone: ' + (phone || '-'),
  appointmentDisplay && 'Appointment: ' + appointmentDisplay,
  auditCompleted && 'Website: ' + website, auditCompleted && 'Company size: ' + companySize,
  auditCompleted && 'Missed calls a week: ' + missedAnswer + ' (about ' + missedMonth + ' a month, around ' + asMoney(missedValue) + ' in cleans)',
  auditCompleted && 'Old quotes: ' + oldAnswer + (revivalValue === null ? '' : ' (about ' + oldCount + ', around ' + asMoney(revivalValue) + ' if revived)'),
  auditCompleted && 'Typical clean: ' + typicalAnswer, auditCompleted && 'Guarantee: ' + guarantee,
  'Page: ' + get(p.pagePath, '/free-audit'), ad && 'Ad: ' + ad,
  track('gclid') && 'GCLID: ' + track('gclid'), track('fbclid') && 'FBCLID: ' + track('fbclid'), track('msclkid') && 'MSCLKID: ' + track('msclkid'),
  smsConsent && 'SMS consent: Yes',
].filter(Boolean).join('\\n');
// Audit delivery is validated AFTER the lead is saved.
`, 'Structure Fields2 delivery comment');
fields.parameters.jsCode = code;

// ---------------------------------------------------------------------------
// 2. Save the full row BEFORE telling the website it was saved.
// ---------------------------------------------------------------------------
const sheet = node('Form-Bookings-sheet4');
const columns = [
  'Website', 'Company Size', 'Missed Calls Answer', 'Missed Calls per Month', 'Missed Call Value',
  'Old Quotes Answer', 'Old Quotes Number', 'Revival Value', 'Typical Clean Answer', 'Guarantee Status',
  'Audit Complete', 'Page Path', 'Visitor Session ID', 'Event', 'UTM Source', 'UTM Medium', 'UTM Campaign',
  'UTM Term', 'UTM Content', 'UTM ID', 'GCLID', 'FBCLID', 'MSCLKID', 'SMS Consent',
];
for (const column of columns) {
  sheet.parameters.columns.value[column] = `={{ $json.sheet[${JSON.stringify(column)}] }}`;
  if (!sheet.parameters.columns.schema.some((s) => s.id === column)) sheet.parameters.columns.schema.push({
    id: column, displayName: column, required: false, defaultMatch: false, display: true,
    type: 'string', canBeUsedToMatch: true, removed: false,
  });
}
// A failed save must fail the execution (HTTP 500), so the website keeps the
// results locked and the visitor's details stay in the form for a retry.
delete sheet.continueOnFail;
delete sheet.onError;

const respond = node('Return Audit Result to Website2');
const f = "$('Structure Fields2').first().json";
respond.parameters.responseBody = `={{ JSON.stringify({ success: true, audit_complete: ${f}.audit_complete, audit: ${f}.audit_complete ? ${f}.audit_results : null, submission_id: ${f}.session_id, message: ${f}.audit_complete ? 'These are rough estimates. Your free 15-minute call confirms the real numbers. Want to pick a time?' : 'Your audit request has been received.' }) }}`;
respond.position = [1504, -496];

connect('Structure Fields2', ['Form-Bookings-sheet4']);
connect('Form-Bookings-sheet4', ['Return Audit Result to Website2']);
connect('Return Audit Result to Website2', ['Get row(s) in sheet2']);

// ---------------------------------------------------------------------------
// 3. Chat history: the code outputs "Contact Details"; the sheet column keeps its spelling.
// ---------------------------------------------------------------------------
node('Chat_History2').parameters.columns.value['Contact Detials'] = "={{ $json['Contact Details'] }}";

// ---------------------------------------------------------------------------
// 4. Team alert with the full audit, and an SMS hand-off for your provider.
//    Both stay on the "email not sent yet" branch, which skips repeat alerts on retries.
// ---------------------------------------------------------------------------
node('Send a message').parameters.text = `={{ ${f}.team_alert_text }}`;

const SMS = 'SMS Payload (connect your provider)';
const smsCode = `// Prepares the "text within 5 minutes" message. It does NOT send anything:
// connect your SMS provider node (Twilio etc.) to this node's output.
// Pass idempotency_key to the provider if it supports one, so retries never text twice.
const d = $('Structure Fields2').first().json;
if (!d.audit_complete || !d.sms_consent || !d.Phone_Number) return [];
return [{ json: {
  to: d.Phone_Number, message: d.sms_text, submission_id: d.session_id,
  idempotency_key: d.session_id + ':audit-sms',
  consent: { granted: true, text: d.sms_consent_text, timestamp: d.Submition_datetime },
} }];`;
const existingSms = workflow.nodes.find((n) => n.name === SMS);
if (existingSms) existingSms.parameters.jsCode = smsCode;
else workflow.nodes.push({
  parameters: { jsCode: smsCode }, type: 'n8n-nodes-base.code', typeVersion: 2,
  position: [2096, 112], id: '6c1f4a2e-3b7d-4e59-9a0c-8d2e5f7b1a43', name: SMS,
});
const notSent = workflow.connections['If Email Already Sent2'].main;
const second = notSent[1] ?? [];
if (!second.some((e) => e.node === SMS)) second.push(edge(SMS));
notSent[1] = second;

// Every connection must point at a real node.
for (const [from, connection] of Object.entries(workflow.connections)) {
  node(from);
  for (const branch of connection.main) for (const e of branch ?? []) node(e.node);
}

fs.writeFileSync(output, JSON.stringify(workflow, null, 2) + '\n');
console.log(`Wrote ${output instanceof URL ? 'docs/n8n-live-workflow.patched.json' : output}. Back up the live workflow, add the new sheet columns, then import it in n8n.`);

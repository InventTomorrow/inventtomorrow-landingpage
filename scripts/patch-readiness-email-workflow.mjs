import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

// Adds a report-only email branch to the existing exported workflow. No live API calls.
export function patchReadinessEmail(source) {
  const workflow = structuredClone(source);
  const node = (name) => {
    const found = workflow.nodes.find((item) => item.name === name);
    if (!found) throw new Error(`Missing workflow node: ${name}`);
    return found;
  };
  const add = (name, template, parameters, position) => {
    const copy = structuredClone(template);
    Object.assign(copy, { id: randomUUID(), name, parameters, position });
    delete copy.onError;
    workflow.nodes.push(copy);
    return copy;
  };
  const edge = (name) => ({ node: name, type: 'main', index: 0 });
  const connect = (from, ...outputs) => { workflow.connections[from] = { main: outputs.map((names) => names.map(edge)) }; };
  const condition = (leftValue, rightValue) => ({
    conditions: { options: { caseSensitive: true, typeValidation: 'strict', version: 2 },
      conditions: [{ id: randomUUID(), leftValue, rightValue, operator: { type: 'string', operation: 'equals' } }], combinator: 'and' }, options: {},
  });
  const fields = node('Structure Fields2');
  fields.parameters.jsCode = `const normalized = (() => {\n${fields.parameters.jsCode}\n})();
const input = $input.first().json;
const payload = input.body ?? input;
if (payload.event === 'readiness_scorecard_completed') {
  const report = payload.scorecardEmail;
  if (typeof report?.subject !== 'string' || !report.subject.trim() || report.subject.length > 200 || /[\\r\\n]/.test(report.subject)
    || typeof report.text !== 'string' || !report.text.trim() || report.text.length > 30000) throw new Error('Missing or invalid readiness report');
  normalized[0].json.readiness_report = { subject: report.subject, text: report.text };
}
return normalized;`;

  add('Route Readiness Report', node('If Form Data2'), condition("={{ String(Boolean($('Structure Fields2').first().json.readiness_report)) }}", 'true'), [1480, 980]);
  const lookup = add('Get Existing Readiness Email', node('Get row(s) in sheet2'), structuredClone(node('Get row(s) in sheet2').parameters), [1700, 900]);
  lookup.alwaysOutputData = true;
  lookup.parameters.options = { ...lookup.parameters.options, returnFirstMatch: true };
  add('If Readiness Email Sent', node('If Email Already Sent2'), condition("={{ String($json['Email Status'] || '').trim().toUpperCase() }}", 'READINESS_SENT'), [1920, 900]);
  add('Prepare Readiness Report Email', fields, { jsCode: `const d = $('Structure Fields2').first().json;
if (!d.readiness_report || !d.Email) throw new Error('Missing readiness email data');
return [{json: {toEmail: d.Email, subject: d.readiness_report.subject, text: d.readiness_report.text}}];` }, [2140, 1000]);
  const send = add('Send Full Readiness Report', node('Send a message3'), {
    sendTo: '={{ $json.toEmail }}', subject: '={{ $json.subject }}', emailType: 'text', message: '={{ $json.text }}', options: { appendAttribution: false },
  }, [2360, 1000]);
  send.onError = 'continueErrorOutput';

  const status = add('Record Readiness Email Sent', node('Form-Bookings-sheet5'), structuredClone(node('Form-Bookings-sheet5').parameters), [2580, 1000]);
  status.parameters.columns.value = {
    'Session ID': "={{ $('Structure Fields2').first().json.session_id }}",
    'Email Status': 'READINESS_SENT',
    'Email Content': "={{ $('Structure Fields2').first().json.readiness_report.text }}",
  };
  status.onError = 'continueErrorOutput';

  const response = (sent) => ({ respondWith: 'json', responseBody:
    `={{ JSON.stringify({ success: true, submission_id: $('Structure Fields2').first().json.session_id, scorecard_email_sent: ${sent}, scorecard_email_to: $('Structure Fields2').first().json.Email }) }}`,
    options: { responseCode: 200 },
  });
  add('Confirm Readiness Email Sent', node('Return Audit Result to Website2'), response(true), [2820, 900]);
  add('Confirm Readiness Email Pending', node('Return Audit Result to Website2'), response(false), [2820, 1140]);

  // Capture still happens first. Scorecard submissions bypass the legacy cleaning-audit email.
  connect('Form-Bookings-sheet4', ['Route Readiness Report']);
  connect('Route Readiness Report', ['Get Existing Readiness Email'], ['Return Audit Result to Website2']);
  connect('Get Existing Readiness Email', ['If Readiness Email Sent']);
  connect('If Readiness Email Sent', ['Confirm Readiness Email Sent'], ['Prepare Readiness Report Email']);
  connect('Prepare Readiness Report Email', ['Send Full Readiness Report']);
  connect('Send Full Readiness Report', ['Record Readiness Email Sent'], ['Confirm Readiness Email Pending']);
  connect('Record Readiness Email Sent', ['Confirm Readiness Email Sent'], ['Confirm Readiness Email Pending']);
  workflow.name = `${workflow.name} — readiness report email`;
  workflow.active = false;
  delete workflow.id;
  delete workflow.versionId;
  delete workflow.activeVersionId;
  return workflow;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const input = process.argv[2] || new URL('../docs/n8n-live-workflow.patched.json', import.meta.url);
  const output = process.argv[3] || new URL('../docs/n8n-readiness-email-workflow.json', import.meta.url);
  const workflow = patchReadinessEmail(JSON.parse(fs.readFileSync(input, 'utf8')));
  fs.writeFileSync(output, `${JSON.stringify(workflow, null, 2)}\n`);
  console.log('Prepared the readiness email workflow export. No live workflow was changed.');
}

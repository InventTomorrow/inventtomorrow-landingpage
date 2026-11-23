import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { patchReadinessEmail } from './patch-readiness-email-workflow.mjs';

// Prepare an inactive export. This script never contacts n8n or sends email.
export function patchBusinessAudit(source) {
  const workflow = patchReadinessEmail(source);
  const find = (name) => {
    const node = workflow.nodes.find((candidate) => candidate.name === name);
    if (!node) throw new Error(`Missing workflow node: ${name}`);
    return node;
  };
  const fields = find('Structure Fields2');
  fields.parameters.jsCode = `const records = (() => {\n${fields.parameters.jsCode}\n})();
const input = $input.first().json;
const payload = input.body ?? input;
if (payload.event === 'cleaning_business_audit_completed') {
  if (payload.businessAudit?.version !== 1 || !Array.isArray(payload.businessAudit.responses)
    || payload.businessAudit.responses.length !== 16) throw new Error('Missing cleaning-business questionnaire');
  records[0].json.business_audit = payload.businessAudit;
  records[0].json.audit_report_input = payload.auditReportInput;
  const email = payload.businessAuditEmail;
  if (typeof email?.subject !== 'string' || !email.subject.trim() || email.subject.length > 200 || /[\\r\\n]/.test(email.subject)
    || typeof email.text !== 'string' || !email.text.trim() || email.text.length > 30000) throw new Error('Missing cleaning-business report email');
  records[0].json.business_audit_email = { subject: email.subject, text: email.text, delivery: email.delivery === 'server_gmail' ? 'server_gmail' : 'n8n' };
  records[0].json.sheet['Audit Complete'] = 'Yes';
}
return records;`;

  const route = structuredClone(find('Route Readiness Report'));
  route.id = randomUUID();
  route.name = 'Route Cleaning Business Audit';
  route.position = [1480, 1240];
  route.parameters.conditions.conditions[0].leftValue = "={{ String(Boolean($('Structure Fields2').first().json.business_audit)) }}";

  const confirm = structuredClone(find('Confirm Readiness Email Pending'));
  confirm.id = randomUUID();
  confirm.name = 'Confirm Cleaning Business Audit Saved';
  confirm.position = [1720, 1240];
  confirm.parameters.responseBody = "={{ JSON.stringify({ success: true, submission_id: $('Structure Fields2').first().json.session_id, business_audit_saved: true, report_email_sent: false }) }}";
  workflow.nodes.push(route, confirm);

  const copy = (name, template, parameters, position) => {
    const node = { ...structuredClone(find(template)), id: randomUUID(), name, parameters, position };
    delete node.onError;
    workflow.nodes.push(node);
    return node;
  };
  const lookup = copy('Get Existing Business Audit Email', 'Get Existing Readiness Email', structuredClone(find('Get Existing Readiness Email').parameters), [1940, 1240]);
  lookup.onError = 'continueErrorOutput';
  const condition = structuredClone(find('If Readiness Email Sent').parameters);
  condition.conditions.conditions[0].rightValue = 'BUSINESS_AUDIT_SENT';
  copy('If Business Audit Email Sent', 'If Readiness Email Sent', condition, [2160, 1240]);
  const deliveryRoute = copy('Route Server Gmail Delivery', 'Route Cleaning Business Audit', structuredClone(route.parameters), [1800, 1120]);
  deliveryRoute.parameters.conditions.conditions[0].leftValue = "={{ String($('Structure Fields2').first().json.business_audit_email?.delivery === 'server_gmail') }}";
  copy('Prepare Business Audit Email', 'Prepare Readiness Report Email', {
    jsCode: `const d = $('Structure Fields2').first().json;
if (!d.business_audit_email || !d.Email) throw new Error('Missing business audit email');
return [{json: {toEmail: d.Email, subject: d.business_audit_email.subject, text: d.business_audit_email.text}}];`,
  }, [2380, 1340]);
  const sender = copy('Send Full Business Audit', 'Send Full Readiness Report', structuredClone(find('Send Full Readiness Report').parameters), [2600, 1340]);
  sender.onError = 'continueErrorOutput';
  const statusParameters = structuredClone(find('Record Readiness Email Sent').parameters);
  statusParameters.columns.value = {
    'Session ID': "={{ $('Structure Fields2').first().json.session_id }}",
    'Email Status': 'BUSINESS_AUDIT_SENT',
    'Email Content': "={{ $('Structure Fields2').first().json.business_audit_email.text }}",
  };
  const status = copy('Record Business Audit Email Sent', 'Record Readiness Email Sent', statusParameters, [2820, 1340]);
  status.onError = 'continueErrorOutput';
  const sent = copy('Confirm Business Audit Email Sent', 'Confirm Cleaning Business Audit Saved', structuredClone(confirm.parameters), [3040, 1240]);
  sent.parameters.responseBody = "={{ JSON.stringify({ success: true, submission_id: $('Structure Fields2').first().json.session_id, business_audit_saved: true, report_email_sent: true, report_email_to: $('Structure Fields2').first().json.Email }) }}";

  const edge = (node) => ({ node, type: 'main', index: 0 });
  // Persist all answers in the existing Appointment_message column before
  // sending the full report. The website shows a blurred preview and requires
  // an explicit recipient/submission acknowledgement before claiming email sent.
  workflow.connections['Form-Bookings-sheet4'] = { main: [[edge(route.name)]] };
  workflow.connections[route.name] = { main: [[edge(deliveryRoute.name)], [edge('Route Readiness Report')]] };
  workflow.connections[deliveryRoute.name] = { main: [[edge(confirm.name)], [edge(lookup.name)]] };
  workflow.connections[lookup.name] = { main: [[edge('If Business Audit Email Sent')], [edge(confirm.name)]] };
  workflow.connections['If Business Audit Email Sent'] = { main: [[edge(sent.name)], [edge('Prepare Business Audit Email')]] };
  workflow.connections['Prepare Business Audit Email'] = { main: [[edge(sender.name)]] };
  workflow.connections[sender.name] = { main: [[edge(status.name)], [edge(confirm.name)]] };
  workflow.connections[status.name] = { main: [[edge(sent.name)], [edge(confirm.name)]] };
  workflow.name = `${workflow.name} — cleaning business questionnaire`;
  return workflow;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const input = process.argv[2] || new URL('../docs/n8n-live-workflow.patched.json', import.meta.url);
  const output = process.argv[3] || new URL('../docs/n8n-business-audit-workflow.json', import.meta.url);
  fs.writeFileSync(output, `${JSON.stringify(patchBusinessAudit(JSON.parse(fs.readFileSync(input, 'utf8'))), null, 2)}\n`);
  console.log('Prepared the cleaning-business questionnaire workflow. No live workflow was changed.');
}

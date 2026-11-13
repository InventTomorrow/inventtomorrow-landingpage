// Refresh the maintained export, or adapt a new export: node scripts/sync-audit-workflow.mjs <input.json>
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { AUDIT_EMAIL_SYSTEM_PROMPT } from '../server/auditPrompts.ts';
import { FOUNDING_SPOTS_LEFT } from '../src/utils/freeAudit.ts';

const destination = new URL('../docs/n8n-free-audit-workflow.json', import.meta.url);
const workflow = JSON.parse(fs.readFileSync(process.argv[2] || destination, 'utf8'));
const node = (name) => {
  const found = workflow.nodes.find((n) => n.name === name);
  if (!found) throw new Error(`Missing node: ${name}`);
  return found;
};
function add(name, type, parameters, position, typeVersion = 2) {
  let found = workflow.nodes.find((n) => n.name === name);
  if (!found) {
    found = { id: randomUUID(), name, type, typeVersion, position, parameters };
    workflow.nodes.push(found);
  } else Object.assign(found, { type, typeVersion, parameters });
  return found;
}
const edge = (name) => ({ node: name, type: 'main', index: 0 });
const connect = (from, ...outputs) => { workflow.connections[from] = { main: outputs.map((names) => names.map(edge)) }; };
const condition = (leftValue, rightValue = 'true') => ({
  conditions: { options: { caseSensitive: true, typeValidation: 'strict', version: 2 },
    conditions: [{ id: randomUUID(), leftValue, rightValue, operator: { type: 'string', operation: 'equals' } }], combinator: 'and' }, options: {},
});

// This function runs inside n8n's Code node. No dependency on website modules.
function normalizeSubmission(input, foundingSpotsLeft) {
  const SETTINGS = {
    founderName: 'Abdul Hadi', // From the website's Founder & CEO listing; editable here.
    bookingLink: 'https://www.inventtomorrow.pro/free-audit?book=1',
    teamAlertEmail: '', // Set Abdul Hadi's actual email in n8n; no guessed address.
    businessMailingAddress: '',
    unsubscribeLink: '',
  };
  const p = input.body ?? input;
  const lead = p.lead ?? {};
  const answers = p.answers ?? {};
  const text = (value) => String(value ?? '').trim();
  const quick = p.event === 'quick_audit_completed';
  if (p.source !== 'form_data' || !['quick_audit_completed', 'audit_request'].includes(p.event)) throw new Error('Unsupported form event');
  const submissionId = text(p.submissionId);
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(submissionId)) throw new Error('Missing or invalid submissionId');
  const sessionId = text(p.sessionId);
  const business = text(lead.businessName || answers.businessName);
  const email = text(lead.email).toLowerCase();
  const phone = text(lead.phone);
  if (!business || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+1\d{10}$/.test(phone)) throw new Error('Missing valid lead fields');
  const range = (value) => text(value).replace(/[–—−]/g, '-');
  const missedOptions = ['0-5', '6-15', '16-30', 'More than 30', 'Not sure'];
  const oldOptions = ['Under 50', '50-200', '200-500', 'More than 500', 'Not sure'];
  const priceOptions = ['Under $120', '$120-$180', '$180-$250', 'Over $250'];
  const missedIndex = missedOptions.indexOf(range(answers.missedCalls));
  const oldIndex = oldOptions.indexOf(range(answers.oldQuotes));
  const priceIndex = priceOptions.indexOf(range(answers.typicalClean));
  const companySize = text(lead.companySize);
  const website = text(lead.website);
  if (quick) {
    if ([missedIndex, oldIndex, priceIndex].includes(-1)
      || !['Just me', '2-4 cleaners', '5-10 cleaners', 'More than 10'].includes(range(companySize))
      || !website || (website !== 'none' && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(website))
      || text(answers.businessName) !== business) throw new Error('Incomplete quick audit');
  } else if (!text(lead.name) || !text(p['appointment datetime']) || !text(p.appointmentTimeZone)) {
    throw new Error('Incomplete appointment request');
  }
  const weekly = [3, 10, 23, 35, 10][missedIndex];
  const oldCount = quick ? [30, 125, 350, 600, null][oldIndex] : null;
  const cleanPrice = [100, 150, 215, 275][priceIndex];
  // Whole-number monthly calls, matching the live n8n workflow and src/utils/freeAudit.ts.
  const missedMonth = quick ? Math.round(weekly * 4.3) : null;
  const nearest50 = (value) => Math.round(value / 50) * 50;
  const missedValue = quick ? nearest50(missedMonth * 0.2 * cleanPrice) : null;
  const revivalValue = quick && oldCount !== null ? nearest50(oldCount * 0.09 * cleanPrice) : null;
  const guarantee = quick && oldIndex >= 2 && oldIndex <= 3 ? 'qualifies' : quick && oldIndex === 1 ? 'close' : 'none';
  const results = {
    business_name: business, missed_calls_month: missedMonth, missed_call_value: missedValue,
    old_quotes_number: oldCount, revival_value: revivalValue, guarantee_status: guarantee, estimates_are_rough: true,
  };
  const auditPayload = {
    business_name: business, company_size: companySize, website,
    missed_calls_answer: text(answers.missedCalls), missed_calls_month: missedMonth,
    missed_call_value: missedValue, old_quotes_answer: text(answers.oldQuotes), old_quotes_number: oldCount,
    revival_value: revivalValue, typical_clean_answer: text(answers.typicalClean), guarantee_status: guarantee,
    founding_spots_left: foundingSpotsLeft, booking_link: SETTINGS.bookingLink, sender_name: SETTINGS.founderName,
    subject_opportunity: !quick ? 'none' : revivalValue !== null && revivalValue > missedValue ? 'old_quotes' : 'missed_calls',
  };
  const tracking = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'fbclid', 'msclkid']) {
    if (typeof p.tracking?.[key] === 'string') tracking[key] = p.tracking[key].slice(0, 500);
  }
  const smsConsent = p.smsConsent?.granted === true;
  return [{ json: {
    Name: text(lead.name), 'Business Name': business, 'Bussiness Name': business, Email: email, Phone_Number: phone,
    Appointment_message: text(lead.description),
    Appointment_dateTime: p['appointment datetime'] ? `${text(p['appointment datetime']).replace('T', ' ')} (${text(p.appointmentTimeZone)})` : '',
    Submission_datetime: text(p.timestamp), Submition_datetime: text(p.timestamp),
    session_id: submissionId, sessionId, event: p.event,
    audit_complete: quick, audit_payload: auditPayload, audit_results: results,
    pagePath: text(p.pagePath), tracking,
    sms_consent: smsConsent, sms_consent_text: smsConsent ? text(p.smsConsent.text) : '',
    sms_consent_at: smsConsent ? text(p.timestamp) : '',
    settings: { businessMailingAddress: SETTINGS.businessMailingAddress, unsubscribeLink: SETTINGS.unsubscribeLink },
    team_alert_to: SETTINGS.teamAlertEmail,
    sms_text: `Hi there, thanks for taking the Invent Tomorrow audit. Book your free 15-minute call so we can check your numbers: ${SETTINGS.bookingLink} Reply STOP to opt out.`,
  } }];
}

node('Structure Fields').parameters.jsCode = `${normalizeSubmission.toString()}\nreturn normalizeSubmission($input.first().json, ${FOUNDING_SPOTS_LEFT});`;
node('Email Writer').parameters.responses.values[0].content = AUDIT_EMAIL_SYSTEM_PROMPT;
fs.writeFileSync(new URL('../docs/prompts/audit-email-system-prompt.md', import.meta.url), `${AUDIT_EMAIL_SYSTEM_PROMPT}\n`);

// Save first, then explicitly acknowledge the saved lead, then perform delivery.
connect('Structure Fields', ['Form-Bookings-sheet']);
connect('Form-Bookings-sheet', ['Return Audit Result to Website']);
connect('Return Audit Result to Website', ['Get row(s) in sheet', 'If Team Alert Configured', 'SMS Payload (connect your provider)']);
node('Return Audit Result to Website').parameters = {
  respondWith: 'json',
  responseBody: "={{ JSON.stringify({ success: true, audit_complete: $('Structure Fields').first().json.audit_complete, audit: $('Structure Fields').first().json.audit_complete ? $('Structure Fields').first().json.audit_results : null, submission_id: $('Structure Fields').first().json.session_id }) }}",
  options: { responseCode: 200 },
};

// Keep original sheet column names; add explicit session, tracking and consent fields.
const sheet = node('Form-Bookings-sheet');
for (const key of ['UTM Source', 'UTM Medium', 'UTM Campaign']) delete sheet.parameters.columns.value[key];
const fields = {
  'Visitor Session ID': '$json.sessionId', Event: '$json.event',
  'UTM Source': '$json.tracking.utm_source || ""', 'UTM Medium': '$json.tracking.utm_medium || ""',
  'UTM Campaign': '$json.tracking.utm_campaign || ""', 'UTM Term': '$json.tracking.utm_term || ""',
  'UTM Content': '$json.tracking.utm_content || ""', 'UTM ID': '$json.tracking.utm_id || ""',
  GCLID: '$json.tracking.gclid || ""', FBCLID: '$json.tracking.fbclid || ""', MSCLKID: '$json.tracking.msclkid || ""',
  'SMS Consent': '$json.sms_consent ? "Yes" : "No"', 'SMS Consent Text': '$json.sms_consent_text', 'SMS Consent At': '$json.sms_consent_at',
};
for (const [key, expression] of Object.entries(fields)) {
  sheet.parameters.columns.value[key] = `={{ ${expression} }}`;
  if (!sheet.parameters.columns.schema.some((s) => s.id === key)) sheet.parameters.columns.schema.push({
    id: key, displayName: key, required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true, removed: false,
  });
}
sheet.parameters.options.cellFormat = 'RAW';
// Upserting the lead must not reset Email Status: sequential retries skip an already sent email.
node('Get row(s) in sheet').parameters.options.returnFirstMatch = true;
node('Get row(s) in sheet').alwaysOutputData = true;
node('Check Audit Email Setup').parameters.jsCode = `const d = $('Structure Fields').first().json;
const p = d.audit_payload;
if (!p.sender_name || /^SET_/.test(p.sender_name)) throw new Error('Set the founder name in Structure Fields. Lead is saved.');
if (!/^https:\\/\\/[^\\s<>\"]+$/.test(p.booking_link)) throw new Error('Set the booking URL. Lead is saved.');
if (!d.settings.businessMailingAddress || !/^https:\\/\\/[^\\s<>\"]+$/.test(d.settings.unsubscribeLink)) throw new Error('Set the mailing address and unsubscribe URL in Structure Fields before emailing audits. Lead is saved.');
return [{json: d}];`;
// The full original record comes from Structure Fields, not a lossy Google Sheets row.
node('Appointment Request Email').parameters.jsCode = node('Appointment Request Email').parameters.jsCode.replace('const d = $input.first().json;', "const d = $('Structure Fields').first().json;");
const email = node('Structure Email');
const marker = '// Validate values and required delivery details before any customer email is sent.';
if (!email.parameters.jsCode.includes(marker)) email.parameters.jsCode = email.parameters.jsCode.replace("return [{json:{...original, subject, text:body, email_kind:'audit_results'}}];", `${marker}
const allowedAmounts = new Set([payload.missed_call_value, payload.revival_value].filter(v => v !== null && v !== '').map(Number));
for (const amount of (subject + '\\n' + body).matchAll(/\\$([\\d,]+(?:\\.\\d+)?)/g)) {
  if (!allowedAmounts.has(Number(amount[1].replace(/,/g, '')))) throw new Error('Email invented a dollar figure');
}
if (!/rough estimates/i.test(body) || !body.includes(payload.booking_link) || !body.includes(payload.sender_name)) throw new Error('Email is missing estimates disclaimer, booking URL or founder signature');
return [{json:{...original, subject, text:body, email_kind:'audit_results'}}];`);
// The existing email agent writes plain text. The sending tool alone adds the required footer.
node('Email HTML').parameters.jsCode = `const d = $input.first().json;
const footer = d.settings || {};
const text = [d.text, footer.businessMailingAddress, footer.unsubscribeLink ? 'Unsubscribe: ' + footer.unsubscribeLink : ''].filter(Boolean).join('\\n\\n');
return [{json: {...d, toEmail: d.Email, text}}];`;
node('Send a message').parameters.emailType = 'text';
node('Send a message').parameters.message = '={{ $json.text }}';
node('SMS Payload (connect your provider)').parameters.jsCode = `// SMS delivery belongs to your n8n provider branch. This node does not send a text.
const d = $('Structure Fields').first().json;
if (!d.audit_complete || !d.sms_consent) return [];
return [{json: {to: d.Phone_Number, message: d.sms_text, submission_id: d.session_id,
  consent: {granted: true, text: d.sms_consent_text, timestamp: d.sms_consent_at}, idempotency_key: d.session_id + ':audit-sms'}}];`;
// Include all captured tracking tags in the optional team alert, too.
node('Build Team Alert').parameters.jsCode = `const d = $('Structure Fields').first().json;
const escape = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
const fields = {...d.audit_payload, email: d.Email, phone: d.Phone_Number, page: d.pagePath, submission_id: d.session_id, visitor_session: d.sessionId, ...d.tracking};
const html = '<h2>New Invent Tomorrow audit lead</h2>' + Object.entries(fields).filter(([,v]) => v !== null && v !== '').map(([k,v]) => '<p><strong>' + escape(k) + ':</strong> ' + escape(v) + '</p>').join('');
return [{json: {toEmail: d.team_alert_to, subject: 'New audit lead: ' + d['Business Name'], html}}];`;

// An error in one delivery branch must not prevent the others from running.
// Keep error output in execution history and a separate Sheet status for follow-up.
add('Delivery Failure', 'n8n-nodes-base.code', { jsCode: `const d = $('Structure Fields').first().json;
const error = $input.first().json;
return [{json: {submission_id: d.session_id, status: 'FAILED', details: JSON.stringify(error).slice(0, 2000)}}];` }, [2100, 540]);
const failureSheet = add('Record Delivery Failure', 'n8n-nodes-base.googleSheets', {
  ...structuredClone(node('Form-Bookings-sheet1').parameters),
  columns: { ...structuredClone(node('Form-Bookings-sheet1').parameters.columns), value: {
    'Session ID': '={{ $json.submission_id }}',
    'Delivery Error': '={{ $json.details }}',
  } },
}, [2320, 540], 4.7);
failureSheet.parameters.columns.schema = failureSheet.parameters.columns.schema.filter(s => s.id === 'Session ID');
failureSheet.parameters.columns.schema.push({id: 'Delivery Error', displayName: 'Delivery Error', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false, removed: false});
failureSheet.credentials = node('Form-Bookings-sheet1').credentials;
failureSheet.onError = 'continueErrorOutput';
connect('Delivery Failure', ['Record Delivery Failure']);
for (const name of ['Get row(s) in sheet', 'Check Audit Email Setup', 'Email Writer', 'Structure Email',
  'Appointment Request Email', 'Email HTML', 'Send a message', 'Form-Bookings-sheet1',
  'Build Team Alert', 'Send Team Alert', 'SMS Payload (connect your provider)']) {
  node(name).onError = 'continueErrorOutput';
  const outputs = workflow.connections[name]?.main ?? [[]];
  workflow.connections[name] = { main: [outputs[0], [edge('Delivery Failure')]] };
}

// Merge the maintained chat version guard into the shared workflow, with an explicit acknowledgement.
const chat = JSON.parse(fs.readFileSync(new URL('../docs/n8n-chat-history-workflow.json', import.meta.url), 'utf8'));
node('Structure Output1').parameters.jsCode = chat.nodes.find((n) => n.name === 'Structure Output').parameters.jsCode;
const existingChat = chat.nodes.find((n) => n.name === 'Read existing chat');
add('Read existing chat', existingChat.type, existingChat.parameters, [750, 700], existingChat.typeVersion).credentials = node('Chat_History').credentials;
node('Read existing chat').alwaysOutputData = true;
const gate = chat.nodes.find((n) => n.name === 'Keep newest chat');
add('Keep newest chat', gate.type, { jsCode: gate.parameters.jsCode.replace("$('Structure Output')", "$('Structure Output1')").replace('return [];', 'return [{json: {...incoming, skip_write: true}}];') }, [980, 700], gate.typeVersion);
add('If Chat Already Saved', 'n8n-nodes-base.if', condition('={{ String($json.skip_write === true) }}'), [1200, 700], 2.4);
const chatSheet = chat.nodes.find((n) => n.name === 'Append or update row in sheet');
node('Chat_History').parameters = chatSheet.parameters;
node('Chat_History').parameters.options.cellFormat = 'RAW';
add('Return Chat Saved', 'n8n-nodes-base.respondToWebhook', {
  respondWith: 'json', responseBody: '={{ JSON.stringify({success: true, saved: true}) }}', options: { responseCode: 200 },
}, [1600, 700], 1.4);
connect('Structure Output1', ['Read existing chat']);
connect('Read existing chat', ['Keep newest chat']);
connect('Keep newest chat', ['If Chat Already Saved']);
connect('If Chat Already Saved', ['Return Chat Saved'], ['Chat_History']);
connect('Chat_History', ['Return Chat Saved']);

workflow.name = 'Invent Tomorrow — synced free audit, leads and emails';
workflow.active = false;
workflow.settings.executionOrder = 'v1';
fs.writeFileSync(destination, JSON.stringify(workflow, null, 2) + '\n');
console.log('Wrote docs/n8n-free-audit-workflow.json (inactive; configure delivery settings before activation).');

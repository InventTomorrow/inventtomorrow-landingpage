import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { renderBusinessAuditEmail } from '../server/auditEmail.ts';
import { auditEmailReport } from './fixtures/audit-email-report.mjs';

const output = new URL('../output/audit-email/', import.meta.url);
mkdirSync(output, { recursive: true });
const image = readFileSync(new URL('../public/images/hero-cleaning-automation.jpg', import.meta.url));
const imageSource = `data:image/jpeg;base64,${image.toString('base64')}`;
// Embed the same site font files so the standalone preview also works offline.
function previewHtml(report) {
  let html = renderBusinessAuditEmail(report, imageSource);
  for (const name of ['dm-sans-latin-9fea608a947e.woff2', 'outfit-latin-6c18d579fd87.woff2']) {
    const font = readFileSync(new URL(`../public/fonts/${name}`, import.meta.url));
    html = html.replace(`https://www.inventtomorrow.pro/fonts/${name}`, `data:font/woff2;base64,${font.toString('base64')}`);
  }
  return html;
}
writeFileSync(new URL('preview.html', output), previewHtml(auditEmailReport));
const longReport = structuredClone(auditEmailReport);
longReport.businessName = 'Bright Home Cleaning & Property Care — Residential and Commercial Services';
longReport.findings[0].heading = 'A longer finding title stays readable when a business has a more detailed audit report.';
longReport.findings[0].body = Array(4).fill(auditEmailReport.findings[0].body).join('\n\n');
longReport.nextConversation = Array(5).fill(auditEmailReport.nextConversation).join('\n\n');
writeFileSync(new URL('preview-long.html', output), previewHtml(longReport));
console.log('Saved standalone sample previews to output/audit-email/preview.html and preview-long.html. No email sent.');

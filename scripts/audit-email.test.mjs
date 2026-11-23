import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { AUDIT_EMAIL_BLUE, AUDIT_EMAIL_IMAGE_CID, renderBusinessAuditEmail } from '../server/auditEmail.ts';
import { sendAuditReportEmail } from '../server/gmail.ts';
import { auditEmailReport } from './fixtures/audit-email-report.mjs';

const image = readFileSync(new URL('../public/images/hero-cleaning-automation.jpg', import.meta.url));

test('the email uses the website blue, every report section and the original numbered-card structure', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const websiteBlue = css.match(/--color-accent:\s*(#[0-9a-f]{6})/i)[1];
  assert.equal(AUDIT_EMAIL_BLUE.toLowerCase(), websiteBlue.toLowerCase());
  const html = renderBusinessAuditEmail(auditEmailReport);
  for (const text of [auditEmailReport.businessName, auditEmailReport.bigPicture, auditEmailReport.business.overview,
    auditEmailReport.whyThisMatters, auditEmailReport.illustrativeOpportunity, auditEmailReport.nextConversation,
    ...auditEmailReport.findings.flatMap((finding) => [finding.heading, finding.body])]) assert.ok(html.includes(text));
  assert.ok(html.includes(`background="cid:${AUDIT_EMAIL_IMAGE_CID}"`));
  assert.ok(html.includes(`background-image:url('cid:${AUDIT_EMAIL_IMAGE_CID}')`));
  assert.ok(html.includes(`<v:fill type="frame" src="cid:${AUDIT_EMAIL_IMAGE_CID}"`));
  assert.doesNotMatch(html, /<img\b/i, 'the hero image is behind the header copy, not in a separate image row');
  assert.equal((html.match(/width="40" valign="top"/g) || []).length, 3);
  assert.match(html, /https:\/\/www.inventtomorrow.pro\/free-audit\?book=1/);
  assert.doesNotMatch(html, /#527ff7|Start the semester|Activate now|display:grid|display:flex|var\(--|clamp\(/i);
  assert.ok(Buffer.byteLength(html, 'utf8') < 100_000);
  const homepageHero = readFileSync(new URL('../src/components/HeroSection.tsx', import.meta.url), 'utf8');
  assert.ok(homepageHero.includes("'/images/hero-cleaning-automation.jpg'"), 'reuse the first landing-page section artwork');
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(vercel.functions['api/audit.ts'].includeFiles, 'public/images/hero-cleaning-automation.jpg');
});

test('business and AI text cannot inject markup, and long reports expand without truncation', () => {
  const report = structuredClone(auditEmailReport);
  report.businessName = 'A&B <img src=x onerror=alert(1)>';
  report.findings[2].heading = '"Heading" <script>alert(1)</script>';
  report.findings[2].body = 'A & B\nSecond line\n\n' + 'Long report text. '.repeat(500);
  const html = renderBusinessAuditEmail(report);
  assert.ok(html.includes('A&amp;B &lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(html.includes('&quot;Heading&quot; &lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('A &amp; B<br>Second line'));
  assert.ok(html.includes('Long report text. '.repeat(500)));
  assert.doesNotMatch(html, /<script|<img src=x|text-overflow|line-clamp|max-height:(?!0)/i);
});

test('Gmail packages plain text, dynamic HTML and the unchanged image into matching MIME parts', async (t) => {
  let mime;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (String(url).includes('oauth2.googleapis.com')) return Response.json({ access_token: 'mock-access', token_type: 'Bearer' });
    mime = Buffer.from(JSON.parse(options.body).raw, 'base64url').toString('utf8');
    return Response.json({ id: 'accepted-html' });
  });
  const html = renderBusinessAuditEmail(auditEmailReport);
  const text = 'Plain-text fallback with the complete report.';
  const result = await sendAuditReportEmail({ to: 'lead@example.com', submissionId: 'html-template-test', text, html }, {
    GMAIL_AUDIT_REPORTS_ENABLED: 'true', GOOGLE_CLIENT_ID: 'mock-client', GOOGLE_CLIENT_SECRET: 'mock-secret',
    GMAIL_REFRESH_TOKEN: 'mock-refresh', GMAIL_SENDER_EMAIL: 'reports@example.com',
  });
  assert.equal(result.sent, true);
  const alternative = mime.match(/Content-Type: multipart\/alternative; boundary="([^"]+)"/)[1];
  assert.ok(alternative.length <= 70);
  assert.match(mime, /Content-Type: multipart\/related; boundary=/);
  const encodedPart = (type) => mime.match(new RegExp(`Content-Type: ${type}[^\\r]*\\r\\nContent-Transfer-Encoding: base64\\r\\n\\r\\n([A-Za-z0-9+/=\\r\\n]+)(?=\\r\\n--)`))[1];
  assert.equal(Buffer.from(encodedPart('text/plain'), 'base64').toString('utf8'), text);
  assert.equal(Buffer.from(encodedPart('text/html'), 'base64').toString('utf8'), html.replace(/\r?\n/g, '\r\n'));
  const encodedImage = mime.match(/Content-Disposition: inline; filename="audit-hero.jpg"\r\n\r\n([A-Za-z0-9+/=\r\n]+)(?=\r\n--)/)[1];
  assert.match(mime, /Content-Type: image\/jpeg; name="audit-hero.jpg"/);
  assert.deepEqual(Buffer.from(encodedImage, 'base64'), image, 'image bytes are preserved exactly');
  assert.ok(mime.includes(`Content-ID: <${AUDIT_EMAIL_IMAGE_CID}>`));
  assert.ok(mime.endsWith(`--${alternative}--\r\n`));
});

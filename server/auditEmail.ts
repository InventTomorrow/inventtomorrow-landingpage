import type { BusinessAuditReport } from '../src/utils/businessAudit.ts';

export const AUDIT_EMAIL_BLUE = '#2077BC';
export const AUDIT_EMAIL_IMAGE_CID = 'audit-hero@inventtomorrow.pro';
const BOOKING_URL = 'https://www.inventtomorrow.pro/free-audit?book=1';
const BODY_FONT = "'DM Sans',Arial,Helvetica,sans-serif";
const HEADING_FONT = "'Outfit',Arial,Helvetica,sans-serif";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function paragraphs(value: string) {
  return value.split(/\n\s*\n/).map((paragraph) =>
    `<p style="margin:0 0 12px;font-family:${BODY_FONT};font-size:15px;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`).join('');
}

const button = (onLight = false) => {
  const background = onLight ? AUDIT_EMAIL_BLUE : '#ffffff';
  const color = onLight ? '#ffffff' : AUDIT_EMAIL_BLUE;
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="${background}" style="border-radius:5px;"><a href="${BOOKING_URL}" style="display:inline-block;padding:13px 19px;color:${color};background-color:${background};font-family:${BODY_FONT};font-size:14px;line-height:20px;font-weight:bold;text-decoration:none;border:1px solid ${background};border-radius:5px;">Book my free call</a></td></tr></table>`;
};

function card(title: string, content: string, number?: number) {
  return `<tr><td class="card-space" style="padding:0 28px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;table-layout:fixed;border:1px solid #d8dde1;border-radius:9px;border-collapse:separate;">
      <tr><td style="padding:17px 20px;border-bottom:1px solid #e7e7e7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;"><tr>
          ${number === undefined ? '' : `<td width="40" valign="top" style="width:40px;color:${AUDIT_EMAIL_BLUE};font-family:${HEADING_FONT};font-size:32px;font-weight:bold;line-height:36px;">${number}</td>`}
          <td valign="middle"><h2 style="margin:0;color:${AUDIT_EMAIL_BLUE};font-family:${HEADING_FONT};font-size:17px;line-height:1.45;font-weight:bold;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(title)}</h2></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:18px 20px 8px;color:#515151;font-family:${BODY_FONT};">${content}</td></tr>
    </table>
  </td></tr>`;
}

// Only renderer-owned tags are emitted. All model/visitor text is escaped.
// The optional image source is for local preview; outbound mail uses the inline CID.
export function renderBusinessAuditEmail(report: BusinessAuditReport, imageSource = `cid:${AUDIT_EMAIL_IMAGE_CID}`) {
  const profile = [
    ['Team size', report.business.teamSize], ['Monthly enquiries', report.business.monthlyEnquiries],
    ['Main lead sources', report.business.leadSources.join(', ')], ['Standard clean', report.business.standardCleanPrice],
  ].map(([label, value]) => `<p style="margin:0 0 9px;font-family:${BODY_FONT};font-size:15px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word;"><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="${AUDIT_EMAIL_BLUE}"><title>Your business audit — ${escapeHtml(report.businessName)}</title>
<!--[if !mso]><!--><style>
  @font-face{font-family:'DM Sans';font-style:normal;font-weight:400 700;font-display:swap;src:url('https://www.inventtomorrow.pro/fonts/dm-sans-latin-9fea608a947e.woff2') format('woff2')}
  @font-face{font-family:'Outfit';font-style:normal;font-weight:500 700;font-display:swap;src:url('https://www.inventtomorrow.pro/fonts/outfit-latin-6c18d579fd87.woff2') format('woff2')}
</style><!--<![endif]-->
<!--[if mso]><style>body,table,td,p,a,h1,h2{font-family:Arial,Helvetica,sans-serif!important}.hero-copy{background-color:#ffffff!important}</style><![endif]-->
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0;mso-table-rspace:0}img{border:0;outline:none;text-decoration:none}body{margin:0!important;padding:0!important;width:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  @media only screen and (max-width:480px){.outer-pad{padding:0!important}.hero-copy{width:100%!important;padding:32px 22px!important}.hero-spacer{display:none!important;width:0!important}.hero-background{background-position:65% center!important}.hero-content{background-image:linear-gradient(90deg,rgba(255,255,255,.82) 0%,rgba(255,255,255,.58) 48%,rgba(255,255,255,.12) 100%)!important}.hero-title{font-size:32px!important}.card-space{padding-left:12px!important;padding-right:12px!important}.section-label{padding-left:18px!important;padding-right:18px!important}.footer-copy{padding:24px 22px!important}}
</style></head>
<body bgcolor="#f5f5f5" style="margin:0;padding:0;background-color:#f5f5f5;font-family:${BODY_FONT};color:#515151;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">Your full cleaning-business audit for ${escapeHtml(report.businessName)}: all three findings and your next conversation.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f5f5f5"><tr><td class="outer-pad" align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#fafafa" style="width:100%;max-width:680px;table-layout:fixed;background-color:#fafafa;font-family:${BODY_FONT};">
  <tr><td class="hero-background" background="${escapeHtml(imageSource)}" bgcolor="#f5f7fa" style="padding:0;background-color:#f5f7fa;background-image:url('${escapeHtml(imageSource)}');background-size:cover;background-position:center;background-repeat:no-repeat;">
    <!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:510pt;height:300pt;"><v:fill type="frame" src="${escapeHtml(imageSource)}" color="#f5f7fa"/><v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:true;"><![endif]-->
    <table class="hero-content" role="presentation" width="100%" height="400" cellspacing="0" cellpadding="0" border="0" style="width:100%;height:400px;table-layout:fixed;background-image:linear-gradient(90deg,rgba(255,255,255,.88) 0%,rgba(255,255,255,.62) 42%,rgba(255,255,255,0) 76%);"><tr>
      <td class="hero-copy" width="60%" valign="middle" style="width:60%;padding:36px 28px;color:#010f34;font-family:${BODY_FONT};">
        <p style="margin:0 0 22px;font-size:12px;line-height:1.5;letter-spacing:1.6px;font-weight:bold;color:${AUDIT_EMAIL_BLUE};">INVENT TOMORROW</p>
        <h1 class="hero-title" style="margin:0 0 16px;font-family:${HEADING_FONT};font-size:38px;line-height:1.12;font-weight:700;color:${AUDIT_EMAIL_BLUE};">Your cleaning<br><em style="color:${AUDIT_EMAIL_BLUE};">business audit</em></h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#515151;overflow-wrap:anywhere;word-break:break-word;">Prepared for <strong>${escapeHtml(report.businessName)}</strong></p>
        ${button(true)}
      </td><td class="hero-spacer" width="40%" aria-hidden="true" style="width:40%;font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>
    <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
  </td></tr>
  <tr><td class="section-label" style="padding:28px 30px 16px;color:${AUDIT_EMAIL_BLUE};font-size:11px;line-height:1.5;letter-spacing:1.8px;font-weight:bold;">YOUR FULL REPORT</td></tr>
  ${card('The big picture', paragraphs(report.bigPicture))}
  ${card('Your business', profile + `<div style="padding-top:9px;">${paragraphs(report.business.overview)}</div>`)}
  <tr><td class="section-label" style="padding:9px 30px 17px;color:${AUDIT_EMAIL_BLUE};font-size:11px;line-height:1.5;letter-spacing:1.4px;font-weight:bold;">WHAT YOUR ANSWERS ARE TELLING US</td></tr>
  ${report.findings.map((finding, index) => card(finding.heading, paragraphs(finding.body), index + 1)).join('')}
  ${card('Why this matters', paragraphs(report.whyThisMatters))}
  ${card('Illustrative opportunity', paragraphs(report.illustrativeOpportunity))}
  ${card('The next conversation', paragraphs(report.nextConversation))}
  <tr><td class="footer-copy" bgcolor="#f5f7fa" style="padding:28px 36px;background-color:#f5f7fa;color:#515151;font-family:${BODY_FONT};">
    <h2 style="margin:0 0 18px;font-family:${HEADING_FONT};font-size:18px;line-height:1.5;font-weight:bold;color:${AUDIT_EMAIL_BLUE};">Let&rsquo;s talk about your business.</h2>${button(true)}
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#515151;">Prepared with AI from your audit answers for Invent Tomorrow.<br>You received this report because you completed our business audit.</p>
    <p style="margin:12px 0 0;font-size:12px;line-height:1.7;"><a href="https://www.inventtomorrow.pro" style="color:${AUDIT_EMAIL_BLUE};text-decoration:underline;">inventtomorrow.pro</a></p>
  </td></tr>
</table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { escapeHtml, getOutputFile, getSitePages } from '../src/utils/seo';
import { OPTIMIZED_IMAGES } from '../src/content/optimizedImages';
import { getPageKey } from '../src/utils/pageModules';
import { AUDIT_ADS_PATH, AUDIT_PATH, BOOKING_PATH } from '../src/utils/navigation';

// Verify the actual production artifacts, not just a successful Vite compilation.
const output = path.resolve('dist');
const pages = getSitePages();
const manifest = JSON.parse(await readFile(path.join(output, '.vite', 'manifest.json'), 'utf8'));
for (const { meta } of pages) {
  const html = await readFile(path.join(output, getOutputFile(meta.path)), 'utf8');
  assert.ok(html.includes(`<title>${escapeHtml(meta.title)}</title>`), `${meta.path}: incorrect title`);
  assert.ok(html.includes(`content="${escapeHtml(meta.description)}"`), `${meta.path}: missing description`);
  assert.ok(html.includes('id="root" data-prerendered'), `${meta.path}: missing prerendered content`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${meta.path}: expected one main heading`);
  assert.ok(!html.includes('Loading the site'), `${meta.path}: blocking loading screen returned`);
  assert.ok(!html.includes('fonts.googleapis.com'), `${meta.path}: external render-blocking font stylesheet returned`);
  const entry = manifest[`src/pages/${getPageKey(meta.path)}.tsx`];
  assert.ok(entry && html.includes(`href="/${entry.file}"`), `${meta.path}: current route is not preloaded`);
}
const home = await readFile(path.join(output, 'index.html'), 'utf8');
assert.ok(!/<h1[^>]*style="[^"]*opacity:0/.test(home), 'The first heading must be visible before hydration');
assert.ok(!home.includes('href="/' + manifest['src/pages/HomeSections.tsx'].file + '"'), 'Below-fold code must not be a critical preload');
assert.ok(!/href="\/assets\/lenis-[^"]+\.js"/.test(home), 'Desktop scroll easing must not be a critical preload');
const fonts = [...home.matchAll(/href="(\/fonts\/[^" ]+\.woff2)"/g)];
assert.equal(fonts.length, 2, 'Preload the two local font families');
for (const [, source] of fonts) {
  const font = await readFile(path.join(output, source));
  assert.equal(font.subarray(0, 4).toString(), 'wOF2', `Invalid local font: ${source}`);
}
const notFound = await readFile(path.join(output, '404.html'), 'utf8');
assert.ok(notFound.includes('content="noindex"'), '404 page must not be indexed');
const ads = await readFile(path.join(output, getOutputFile(AUDIT_ADS_PATH)), 'utf8');
const audit = await readFile(path.join(output, getOutputFile(AUDIT_PATH)), 'utf8');
const adsHeader = ads.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
assert.ok(adsHeader, 'Ads page must have a header');
assert.ok(adsHeader.includes('alt="Invent Tomorrow"'), 'Ads header must display the logo');
assert.ok(!/<a\b|<button\b|<nav\b/.test(adsHeader), 'Ads header must contain only the logo');
assert.ok(!/<nav\b|<footer\b|Run My Audit|Open menu/i.test(ads), 'Ads page must omit navigation, audit CTA and footer');
assert.ok(!/<a\b[^>]*href="\/(?!\/)/.test(ads), 'Ads page must have no links to other site pages');
assert.ok(ads.includes('content="noindex"'), 'Ads page must not be indexed');
for (const html of [ads, audit]) {
  assert.ok(html.includes('Where are you losing the most time or potential jobs?'), 'Both audit pages must start with Invo\'s welcome');
  assert.ok(/<button[^>]*aria-haspopup="dialog"[^>]*>[\s\S]*?Book My Free Audit/.test(html), 'Both audit pages must open the audit form');
  assert.ok(html.includes('id="audit-chat-input"'), 'Both audit pages must include the chat composer');
  for (const suggestion of ['Missed Calls', 'Quote Follow-Ups', 'Old Leads', 'Repeat Bookings']) {
    assert.ok(html.includes(suggestion), `Missing chat suggestion: ${suggestion}`);
  }
}
assert.ok(/<nav\b/.test(audit), 'Regular audit page must retain its navigation');
assert.ok(!/<footer\b/.test(audit), 'Regular audit page must retain its pinned layout without a footer');
const contact = await readFile(path.join(output, 'contact', 'index.html'), 'utf8');
assert.ok(contact.includes('id="book-or-message"') && contact.includes('aria-label="Free audit request"'), 'Existing booking links must lead to the audit form');
for (const field of ['name', 'businessName', 'email', 'phone', 'description', 'appointment datetime', 'appointmentTimeZone']) {
  assert.ok(contact.includes(`name="${field}"`), `Audit form missing ${field}`);
}
assert.ok(contact.includes('aria-label="Choose appointment date and time"'), 'The custom appointment selector must be present');
assert.ok(!contact.includes('type="datetime-local"'), 'The browser datetime picker must not return');
assert.ok(/<input(?=[^>]*name="appointment datetime")(?=[^>]*type="hidden")[^>]*>/.test(contact), 'The custom selector must submit one combined datetime');
assert.ok(/<input(?=[^>]*name="appointmentTimeZone")(?=[^>]*value="America\/New_York")[^>]*>/.test(contact), 'Appointments must default to US Eastern Time');
assert.ok(!contact.includes('<select'), 'The appointment time zone must remain hidden');
assert.ok(contact.includes(`href="${BOOKING_PATH}"`), 'The contact CTA must still target the booking section');
for (const html of [ads, audit, contact]) {
  assert.ok(!/calendly\.com|<iframe\b/i.test(html), 'Audit and contact pages must not contain the removed calendar');
}
for (const file of ['sitemap.xml', 'llms.txt', 'robots.txt']) {
  const content = await readFile(path.join(output, file), 'utf8');
  assert.ok(content.length > 0, `${file}: missing or empty`);
  if (file !== 'robots.txt') assert.ok(!content.includes(AUDIT_ADS_PATH), `${file}: ads page must be direct-only`);
}
const assets = await readdir(path.join(output, 'assets'));
assert.ok(assets.some((file) => file.endsWith('.js')), 'Client JavaScript was not generated');
assert.ok(assets.some((file) => file.endsWith('.css')), 'Client CSS was not generated');
// Responsive image URLs must exist in the deployed output, including every srcset size.
const imageFiles = new Set(Object.values(OPTIMIZED_IMAGES).flatMap((image) => [
  image.src,
  ...image.srcSet.split(', ').map((candidate) => candidate.split(' ')[0]),
]));
for (const source of imageFiles) {
  assert.ok(source.startsWith('/images/optimized/') && /-\d+-[a-f0-9]{12}\.webp$/.test(source), `Unversioned optimized image: ${source}`);
  assert.ok((await stat(path.join(output, source))).size > 0, `Missing image variant: ${source}`);
}
console.log(`Deployment artifacts verified: ${pages.length} prerendered pages, 404, sitemap, llms.txt, robots.txt and client assets.`);
console.log(`Verified ${imageFiles.size} responsive image files.`);

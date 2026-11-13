import test from 'node:test';
import assert from 'node:assert/strict';
import { POSTS } from '../content/blog';
import { CASE_STUDIES } from '../content/caseStudies';
import { PAGE_META } from '../content/pages';
import { AUDIT_ADS_PATH, NAV_ITEMS } from './navigation';
import {
  SITE_URL,
  absoluteUrl,
  buildHeadTags,
  buildLlmsTxt,
  buildSitemapXml,
  buildStructuredData,
  getOutputFile,
  getPageName,
  getSitePages,
  injectPage,
  serializeJsonLd,
} from './seo';

const TEMPLATE = '<head><!--app-head--></head><body><div id="root"><!--app-html--><p>Loading</p><!--/app-html--></div></body>';

test('every public page has a unique path, title and description', () => {
  const pages = getSitePages();
  for (const key of ['path', 'title', 'description'] as const) {
    assert.equal(new Set(pages.map((page) => page.meta[key])).size, pages.length, `duplicate ${key}`);
  }
});

test('the sitemap lists every indexable page but not the 404 page', () => {
  const pages = getSitePages();
  const xml = buildSitemapXml(pages, '2026-11-10');
  assert.equal(xml.match(/<url>/g)?.length, pages.filter((page) => page.meta.isIndexable !== false).length);
  assert.ok(xml.includes(`<loc>${SITE_URL}/</loc>`));
  assert.ok(!xml.includes(PAGE_META.notFound.path));
});

test('the ads page is prerendered for direct visits but excluded from site discovery', () => {
  const pages = getSitePages();
  const ads = pages.find((page) => page.meta.path === AUDIT_ADS_PATH);
  assert.ok(ads);
  assert.equal(ads.meta.isIndexable, false);
  assert.ok(buildHeadTags(ads.meta, { ogType: 'website' }).includes('content="noindex"'));
  assert.ok(!buildSitemapXml(pages, '2026-11-11').includes(AUDIT_ADS_PATH));
  assert.ok(!buildLlmsTxt(pages).includes(AUDIT_ADS_PATH));
  assert.ok(!NAV_ITEMS.some((item) => item.to === AUDIT_ADS_PATH));
});

test('blog posts use their own date in the sitemap', () => {
  const xml = buildSitemapXml(getSitePages(), '2026-11-10');
  const post = POSTS[0];
  assert.match(xml, new RegExp(`/blog/${post.slug}</loc>\\s*<lastmod>${post.date}</lastmod>`));
});

test('work and case study routes are included in the prerender page list', () => {
  const paths = getSitePages().map((page) => page.meta.path);
  assert.ok(paths.includes(PAGE_META.ourWork.path));
  for (const study of CASE_STUDIES) assert.ok(paths.includes(`/our-work/${study.slug}`));
});

test('llms.txt starts with the site name and a summary, then lists pages', () => {
  const lines = buildLlmsTxt(getSitePages()).split('\n');
  assert.equal(lines[0], '# Invent Tomorrow');
  assert.ok(lines[2].startsWith('> '));
  assert.ok(lines.includes('## Pages'));
  assert.ok(lines.some((line) => line.startsWith(`- [About Us](${SITE_URL}/about): `)));
});

test('getPageName drops the brand suffix', () => {
  assert.equal(getPageName(PAGE_META.about), 'About Us');
  assert.equal(getPageName(PAGE_META.home), PAGE_META.home.title);
});

test('head tags escape text and add a canonical link', () => {
  const head = buildHeadTags({ path: '/x', title: 'A "quote" & <b>', description: 'd' }, { ogType: 'website' });
  assert.ok(head.includes('<title>A &quot;quote&quot; &amp; &lt;b&gt;</title>'));
  assert.ok(head.includes(`<link rel="canonical" href="${SITE_URL}/x" />`));
  assert.ok(!head.includes('og:image'));
});

test('pages that are not indexable get noindex instead of a canonical link', () => {
  const head = buildHeadTags(PAGE_META.notFound, { ogType: 'website' });
  assert.ok(head.includes('<meta name="robots" content="noindex" />'));
  assert.ok(!head.includes('rel="canonical"'));
});

test('the og:image tags appear only when an image is given', () => {
  const head = buildHeadTags(PAGE_META.home, { ogType: 'website', ogImageUrl: absoluteUrl('/og/default.jpg') });
  assert.ok(head.includes(`<meta property="og:image" content="${SITE_URL}/og/default.jpg" />`));
});

test('structured data: home has WebSite, inner pages have breadcrumbs, posts have an article', () => {
  const types = (data: ReturnType<typeof buildStructuredData>) =>
    (data['@graph'] as { '@type': string }[]).map((node) => node['@type']);

  assert.deepEqual(types(buildStructuredData(PAGE_META.home)), ['Organization', 'WebSite']);
  assert.deepEqual(types(buildStructuredData(PAGE_META.about)), ['Organization', 'BreadcrumbList']);
  assert.deepEqual(types(buildStructuredData(PAGE_META.faq)), ['Organization', 'BreadcrumbList', 'FAQPage']);
  assert.deepEqual(types(buildStructuredData(PAGE_META.notFound)), ['Organization']);

  const post = getSitePages().find((page) => page.post);
  assert.ok(post?.post);
  assert.deepEqual(types(buildStructuredData(post.meta, post.post)), ['Organization', 'BreadcrumbList', 'BlogPosting']);
});

test('JSON-LD cannot close its script tag early', () => {
  const script = serializeJsonLd({ text: '</script><script>alert(1)</script>' });
  assert.equal(script.match(/<\/script>/g)?.length, 1);
});

test('injectPage fills the head and replaces the loader, keeping "$" in page text', () => {
  const html = injectPage(TEMPLATE, '<title>T</title>', '<p>From $99 $&</p>');
  assert.equal(html, '<head><title>T</title></head><body><div id="root" data-prerendered><p>From $99 $&</p></div></body>');
});

test('injectPage refuses a template without markers', () => {
  assert.throws(() => injectPage('<head></head>', '', ''));
});

test('prerendered pages remove the standalone startup loader and retain visible page content', () => {
  const template = TEMPLATE.replace('<body>', '<body><!--app-bootstrap--><div id="app-bootstrap">Brand loading</div><!--/app-bootstrap-->');
  const html = injectPage(template, '<title>Ready</title>', '<h1>Visible page</h1>');
  assert.ok(html.includes('<h1>Visible page</h1>'));
  assert.doesNotMatch(html, /app-bootstrap|Brand loading/);
});

test('getOutputFile maps paths to folder index files', () => {
  assert.equal(getOutputFile('/'), 'index.html');
  assert.equal(getOutputFile('/blog/a-post'), 'blog/a-post/index.html');
});

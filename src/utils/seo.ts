import { POSTS, type Post } from '../content/blog';
import { CASE_STUDIES, type CaseStudy } from '../content/caseStudies';
import { ALL_FAQS } from '../content/faq';
import { LEGAL_DOCS, type LegalDoc } from '../content/legal';
import { PAGE_META, type PageMeta } from '../content/pages';
import { SOCIAL_LINKS } from '../content/social';
import { SERVICE_CATALOG } from '../content/serviceCatalog';
import { SITE_URL, absoluteUrl } from './navigation';

export { SITE_URL, absoluteUrl };
export const SITE_NAME = 'Invent Tomorrow';
const TITLE_SUFFIX = ` | ${SITE_NAME}`;

const HEAD_MARKER = '<!--app-head-->';
const ROOT_PATTERN = /<div id="root">[\s\S]*?<!--\/app-html--><\/div>/;

export interface SitePage {
  meta: PageMeta;
  post?: Post;
}

type JsonLdNode = Record<string, unknown>;

export function getPostMeta(post: Post): PageMeta {
  return { path: `/blog/${post.slug}`, title: `${post.title}${TITLE_SUFFIX}`, description: post.description };
}

export function getCaseStudyMeta(study: CaseStudy): PageMeta {
  return {
    path: `/our-work/${study.slug}`,
    title: study.details?.seoTitle ?? `${study.title}${TITLE_SUFFIX}`,
    description: study.details?.seoDescription ?? study.summary,
  };
}

export function getLegalMeta(doc: LegalDoc): PageMeta {
  return { path: doc.path, title: doc.metaTitle, description: doc.description };
}

// Short name for breadcrumbs and llms.txt: the title without the brand suffix.
export function getPageName(meta: PageMeta) {
  return meta.title.endsWith(TITLE_SUFFIX) ? meta.title.slice(0, -TITLE_SUFFIX.length) : meta.title;
}

// Every prerendered URL. Discovery files exclude pages marked noindex.
export function getSitePages(): SitePage[] {
  const { home, howItWorks, services, about, faq, results, ourWork, freeAudit, freeAuditAds, contact, blog } = PAGE_META;
  return [
    ...[home, howItWorks, services, about, faq, results, ourWork, freeAudit, freeAuditAds, contact, blog].map((meta) => ({ meta })),
    ...CASE_STUDIES.map((study) => ({ meta: getCaseStudyMeta(study) })),
    ...SERVICE_CATALOG.map((service) => ({ meta: service.meta })),
    ...POSTS.map((post) => ({ meta: getPostMeta(post), post })),
    ...LEGAL_DOCS.map((doc) => ({ meta: getLegalMeta(doc) })),
  ];
}

export function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getChangeFrequency({ meta, post }: SitePage) {
  if (post) return 'monthly';
  if (meta.path === '/' || meta.path === PAGE_META.blog.path) return 'weekly';
  if (LEGAL_DOCS.some((doc) => doc.path === meta.path)) return 'yearly';
  return 'monthly';
}

function getPriority({ meta, post }: SitePage) {
  if (meta.path === '/') return '1.0';
  if (post) return '0.6';
  if (LEGAL_DOCS.some((doc) => doc.path === meta.path)) return '0.3';
  return '0.8';
}

export function buildSitemapXml(pages: SitePage[], buildDate: string) {
  const urls = pages.filter((page) => page.meta.isIndexable !== false).map((page) =>
    [
      '  <url>',
      `    <loc>${escapeHtml(absoluteUrl(page.meta.path))}</loc>`,
      `    <lastmod>${page.post?.date ?? buildDate}</lastmod>`,
      `    <changefreq>${getChangeFrequency(page)}</changefreq>`,
      `    <priority>${getPriority(page)}</priority>`,
      '  </url>',
    ].join('\n'),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

// Format: https://llmstxt.org (H1, blockquote summary, then H2 lists of links).
export function buildLlmsTxt(pages: SitePage[]) {
  pages = pages.filter((page) => page.meta.isIndexable !== false);
  const toLine = ({ meta }: SitePage) => `- [${getPageName(meta)}](${absoluteUrl(meta.path)}): ${meta.description}`;
  const isLegal = ({ meta }: SitePage) => LEGAL_DOCS.some((doc) => doc.path === meta.path);
  const mainPages = pages.filter((page) => !page.post && !isLegal(page) && page.meta.path !== '/');

  return [
    `# ${SITE_NAME}`,
    '',
    `> ${PAGE_META.home.description}`,
    '',
    '## Pages',
    '',
    ...mainPages.map(toLine),
    '',
    '## Blog',
    '',
    ...pages.filter((page) => page.post).map(toLine),
    '',
    '## Optional',
    '',
    ...pages.filter(isLegal).map(toLine),
    '',
  ].join('\n');
}

export function buildHeadTags(meta: PageMeta, options: { ogType: 'website' | 'article'; ogImageUrl?: string }) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(absoluteUrl(meta.path));
  const isIndexable = meta.isIndexable !== false;

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    isIndexable ? `<link rel="canonical" href="${url}" />` : '<meta name="robots" content="noindex" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:type" content="${options.ogType}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ];
  if (options.ogImageUrl) {
    const image = escapeHtml(options.ogImageUrl);
    tags.push(
      `<meta property="og:image" content="${image}" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      `<meta name="twitter:image" content="${image}" />`,
    );
  }
  return tags.join('\n    ');
}

function getBreadcrumbs(meta: PageMeta, post?: Post): JsonLdNode {
  const trail = [{ name: 'Home', path: '/' }];
  const service = SERVICE_CATALOG.find((service) => service.path === meta.path);
  if (post) trail.push({ name: getPageName(PAGE_META.blog), path: PAGE_META.blog.path });
  if (service) trail.push({ name: 'Services', path: '/services' });
  trail.push({ name: service?.title ?? getPageName(meta), path: meta.path });

  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

function getArticle(meta: PageMeta, post: Post): JsonLdNode {
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.image.src),
    datePublished: post.date,
    dateModified: post.date,
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(meta.path),
  };
}

function getFaqPage(): JsonLdNode {
  return {
    '@type': 'FAQPage',
    mainEntity: ALL_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

// One JSON-LD graph per page, so no schema type is repeated.
export function buildStructuredData(meta: PageMeta, post?: Post) {
  const graph: JsonLdNode[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: absoluteUrl('/'),
      sameAs: SOCIAL_LINKS.map((link) => link.url),
    },
  ];
  if (meta.isIndexable === false) return { '@context': 'https://schema.org', '@graph': graph };

  if (meta.path === '/') graph.push({ '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') });
  else graph.push(getBreadcrumbs(meta, post));
  if (post) graph.push(getArticle(meta, post));
  if (meta.path === PAGE_META.faq.path) graph.push(getFaqPage());

  return { '@context': 'https://schema.org', '@graph': graph };
}

// Escaping "<" stops content strings from closing the script tag early.
export function serializeJsonLd(data: JsonLdNode) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

// Function replacers, because a "$" in page text would otherwise be read as a replace pattern.
export function injectPage(template: string, head: string, appHtml: string) {
  if (!template.includes(HEAD_MARKER) || !ROOT_PATTERN.test(template)) {
    throw new Error('index.html is missing the <!--app-head--> or <!--/app-html--> marker');
  }
  return template
    // Production pages already contain their content; never cover it with the dev bootstrap.
    .replace(/<!--app-bootstrap-->[\s\S]*?<!--\/app-bootstrap-->/, '')
    .replace(HEAD_MARKER, () => head)
    .replace(ROOT_PATTERN, () => `<div id="root" data-prerendered>${appHtml}</div>`);
}

// Where the HTML for a path is written inside dist/.
export function getOutputFile(path: string) {
  return path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
}

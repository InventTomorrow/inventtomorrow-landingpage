/// <reference types="node" />
// Runs after `vite build`: writes real HTML for every public page, plus 404.html, sitemap.xml and llms.txt.
// Crawlers then read each page's text, headings and links without running JavaScript.
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { PAGE_META, type PageMeta } from '../src/content/pages';
import type { Post } from '../src/content/blog';
import {
  absoluteUrl,
  buildHeadTags,
  buildLlmsTxt,
  buildSitemapXml,
  buildStructuredData,
  getOutputFile,
  getSitePages,
  injectPage,
  serializeJsonLd,
} from '../src/utils/seo';

type RenderPage = typeof import('../src/entry-server').renderPage;

const DIST = path.resolve('dist');
const OG_IMAGE_PATH = '/og/default.jpg';

async function writeDistFile(file: string, content: string) {
  const target = path.join(DIST, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

function buildPageHtml(template: string, appHtml: string, meta: PageMeta, post?: Post) {
  // A share image is added once public/og/default.jpg (1200 × 630 px) exists.
  const ogImageUrl = existsSync(path.join(DIST, OG_IMAGE_PATH)) ? absoluteUrl(OG_IMAGE_PATH) : undefined;
  const head = [
    buildHeadTags(meta, { ogType: post ? 'article' : 'website', ogImageUrl }),
    serializeJsonLd(buildStructuredData(meta, post)),
  ].join('\n    ');
  return injectPage(template, head, appHtml);
}

async function prerenderSite(renderPage: RenderPage) {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const pages = getSitePages();

  for (const { meta, post } of pages) {
    const appHtml = await renderPage(meta.path);
    await writeDistFile(getOutputFile(meta.path), buildPageHtml(template, appHtml, meta, post));
  }

  const notFoundHtml = await renderPage(PAGE_META.notFound.path);
  await writeDistFile('404.html', buildPageHtml(template, notFoundHtml, PAGE_META.notFound));
  await writeDistFile('sitemap.xml', buildSitemapXml(pages, new Date().toISOString().slice(0, 10)));
  await writeDistFile('llms.txt', buildLlmsTxt(pages));

  return pages.length;
}

const vite = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false },
});

try {
  const { renderPage } = (await vite.ssrLoadModule('/src/entry-server.tsx')) as { renderPage: RenderPage };
  const count = await prerenderSite(renderPage);
  console.log(`Pre-rendered ${count} pages, 404.html, sitemap.xml and llms.txt`);
} finally {
  await vite.close();
}

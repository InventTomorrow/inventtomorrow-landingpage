/// <reference types="node" />
// Runs after `vite build`: writes real HTML for every public page, plus 404.html, sitemap.xml and llms.txt.
// Crawlers then read each page's text, headings and links without running JavaScript.
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { PAGE_META, type PageMeta } from '../src/content/pages';
import type { Post } from '../src/content/blog';
import { getPageKey } from '../src/utils/pageModules';
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

interface ManifestEntry { file: string; imports?: string[]; css?: string[] }
type BuildManifest = Record<string, ManifestEntry>;

function pageResources(template: string, pathname: string, manifest: BuildManifest) {
  const visited = new Set<string>();
  const scripts = new Set<string>();
  const styles = new Set<string>();
  const visit = (key: string) => {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    if (!entry) throw new Error(`Missing build manifest entry: ${key}`);
    scripts.add(entry.file);
    entry.css?.forEach((file) => styles.add(file));
    entry.imports?.forEach(visit);
    // Dynamic imports are deliberately excluded: only the current route is critical.
  };
  visit(`src/pages/${getPageKey(pathname)}.tsx`);
  return [
    ...[...scripts].filter((file) => !template.includes(`"/${file}"`)).map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`),
    ...[...styles].filter((file) => !template.includes(`"/${file}"`)).map((file) => `<link rel="stylesheet" crossorigin href="/${file}" />`),
  ].join('\n    ');
}

async function writeDistFile(file: string, content: string) {
  const target = path.join(DIST, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

function buildPageHtml(template: string, appHtml: string, meta: PageMeta, manifest: BuildManifest, post?: Post) {
  // A share image is added once public/og/default.jpg (1200 × 630 px) exists.
  const ogImageUrl = existsSync(path.join(DIST, OG_IMAGE_PATH)) ? absoluteUrl(OG_IMAGE_PATH) : undefined;
  const head = [
    pageResources(template, meta.path, manifest),
    buildHeadTags(meta, { ogType: post ? 'article' : 'website', ogImageUrl }),
    serializeJsonLd(buildStructuredData(meta, post)),
  ].join('\n    ');
  return injectPage(template, head, appHtml);
}

async function prerenderSite(renderPage: RenderPage) {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const manifest = JSON.parse(await readFile(path.join(DIST, '.vite', 'manifest.json'), 'utf8')) as BuildManifest;
  const pages = getSitePages();

  for (const { meta, post } of pages) {
    const appHtml = await renderPage(meta.path);
    await writeDistFile(getOutputFile(meta.path), buildPageHtml(template, appHtml, meta, manifest, post));
  }

  const notFoundHtml = await renderPage(PAGE_META.notFound.path);
  await writeDistFile('404.html', buildPageHtml(template, notFoundHtml, PAGE_META.notFound, manifest));
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

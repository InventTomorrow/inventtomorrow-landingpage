import assert from 'node:assert/strict';
import test from 'node:test';
import { LazyMotion, domAnimation } from 'motion/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ServiceCard } from '../components/ServiceCard';
import { ServicesMenu } from '../components/ServicesMenu';
import { SiteSheet } from '../components/SiteSheet';
import { FIXES } from '../content/fixes';
import { SERVICE_CATALOG, SERVICE_GROUPS } from '../content/serviceCatalog';
import { SERVICE_DETAILS } from '../content/serviceDetails';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { getPageKey } from '../utils/pageModules';
import { buildStructuredData, getSitePages } from '../utils/seo';
import { ServicePage } from './ServicePage';
import { ServicesPage } from './ServicesPage';

function render(path: string, listing = false) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <LazyMotion features={domAnimation}>
        <Routes><Route path={listing ? '/services' : '/services/:slug'} element={listing ? <ServicesPage /> : <ServicePage />} /></Routes>
      </LazyMotion>
    </MemoryRouter>,
  );
}

test('all 16 supplied services render complete pages with working destinations', () => {
  const knownPaths = new Set(getSitePages().map(({ meta }) => meta.path));
  assert.equal(SERVICE_CATALOG.length, 16);
  assert.equal(new Set(SERVICE_CATALOG.map((service) => service.path)).size, 16);
  assert.equal(SERVICE_CATALOG.filter((service) => service.tier === 'core').length, 7);
  for (const summary of SERVICE_CATALOG) {
    const html = render(summary.path);
    const detail = SERVICE_DETAILS.find((item) => item.path === summary.path)!;
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, summary.path);
    assert.equal((html.match(/<details\b/g) ?? []).length, detail.questions.length, summary.path);
    for (const section of ['Service facts', 'The problem', 'How it works', 'What changes for you', 'Questions', 'Related services']) assert.ok(html.includes(section), `${summary.path}: ${section}`);
    for (const destination of [AUDIT_PATH, BOOKING_PATH, '/services']) assert.ok(html.includes(`href="${destination}"`));
    for (const related of detail.related) assert.ok(html.includes(`href="${SERVICE_CATALOG.find((item) => item.title === related)!.path}"`));
    for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) assert.ok(knownPaths.has(match[1]), `${summary.path} links to missing ${match[1]}`);
    assert.doesNotMatch(html, /undefined|Note for you|Target search|\*\*|\\\[|\]\(https/);
  }
});

test('all services are discoverable in the overview, categories and build metadata', () => {
  const html = render('/services', true);
  const pages = getSitePages();
  for (const group of SERVICE_GROUPS) assert.ok(html.includes(`id="${group.id}"`));
  for (const service of SERVICE_CATALOG) {
    assert.ok(html.includes(`href="${service.path}"`));
    assert.ok(SERVICE_GROUPS.some((group) => group.title === service.group));
    assert.equal(getPageKey(service.path), 'ServicePage');
    assert.deepEqual(pages.find(({ meta }) => meta.path === service.path)?.meta, service.meta);
    const crumbs = buildStructuredData(service.meta)['@graph'].find((node) => node['@type'] === 'BreadcrumbList')!;
    assert.match(JSON.stringify(crumbs), /"name":"Services"/);
  }
});

test('the seven existing homepage cards open their matching detail page', () => {
  for (const fix of FIXES) {
    const html = renderToStaticMarkup(<MemoryRouter><ServiceCard fix={fix} number={1} /></MemoryRouter>);
    assert.ok(html.includes(`href="${SERVICE_CATALOG.find((item) => item.title === fix.title)!.path}"`));
  }
});

test('unknown service paths show the existing not-found page', () => {
  assert.match(render('/services/not-a-service'), /not found|find that page/i);
});

test('desktop and mobile navigation expose every service and an overview link', () => {
  const wrap = (children: React.ReactNode) => renderToStaticMarkup(<MemoryRouter><LazyMotion features={domAnimation}>{children}</LazyMotion></MemoryRouter>);
  const desktop = wrap(<ServicesMenu />);
  const mobile = wrap(<SiteSheet isOpen onClose={() => {}} />);
  assert.match(desktop, /aria-expanded="false" aria-controls="desktop-services-menu"/);
  assert.match(desktop, /id="desktop-services-menu"[^>]*hidden/);
  assert.match(mobile, /<summary[^>]*>Services/);
  for (const html of [desktop, mobile]) {
    assert.ok(html.includes('href="/services"'));
    for (const service of SERVICE_CATALOG) assert.ok(html.includes(`href="${service.path}"`), service.path);
  }
});

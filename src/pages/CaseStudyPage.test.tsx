import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { LazyMotion, domAnimation } from 'motion/react';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { CaseStudyCard } from '../components/CaseStudyCard';
import { CASE_STUDIES, type CaseStudy } from '../content/caseStudies';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';
import { CaseStudyPage } from './CaseStudyPage';
import { OurWorkPage } from './OurWorkPage';

const study = CASE_STUDIES.find((item) => item.slug === 'just-about-cleaning-crm-automation-rebuild')!;
const storyPath = `/our-work/${study.slug}`;
const recoveryStudy = CASE_STUDIES.find((item) => item.slug === 'old-leads-revenue-recovery')!;
const recoveryPath = `/our-work/${recoveryStudy.slug}`;

function renderPage(url: string, path: string, Page: ComponentType) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <LazyMotion features={domAnimation}>
        <Routes><Route path={path} element={createElement(Page)} /></Routes>
      </LazyMotion>
    </MemoryRouter>,
  );
}

function withStudies(extra: CaseStudy[], check: () => void) {
  const originalLength = CASE_STUDIES.length;
  try {
    CASE_STUDIES.push(...extra);
    check();
  } finally {
    CASE_STUDIES.splice(originalLength);
  }
}

function withStudySet(studies: CaseStudy[], check: () => void) {
  const original = [...CASE_STUDIES];
  try {
    CASE_STUDIES.splice(0, CASE_STUDIES.length, ...studies);
    check();
  } finally {
    CASE_STUDIES.splice(0, CASE_STUDIES.length, ...original);
  }
}

test('the approved preview uses scope labels, a 16:9 image and one real detail link', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter><LazyMotion features={domAnimation}><CaseStudyCard study={study} /></LazyMotion></MemoryRouter>,
  );
  assert.match(html, /CLIENT STORY · CLEANING SERVICES/);
  assert.match(html, /Just About Cleaning: Fixing Lead and Quote Follow Up/);
  assert.match(html, /Leads were coming in, but some never reached the right place and quotes went unchased\./);
  assert.match(html, /Lead capture/);
  assert.match(html, /Quote tracking/);
  assert.match(html, /Scheduled follow ups/);
  assert.match(html, /View case study/);
  assert.match(html, /aspect-video/);
  assert.match(html, /alt="Laptop on a desk in a cleaning business workspace\."/);
  assert.match(html, /focus-visible:outline/);
  assert.equal((html.match(/<a\s/g) ?? []).length, 1);
  assert.ok(html.includes(`href="${storyPath}"`));
  assert.doesNotMatch(html, /<dl|~2 weeks|Quote acceptance routes connected|Average first reply/);
  assert.match(renderPage('/our-work', '/our-work', OurWorkPage), /grid grid-cols-1 gap-5 md:grid-cols-2/);
});

test('the detail route has one H1 and the approved section order without empty evidence blocks', () => {
  const html = renderPage(storyPath, '/our-work/:slug', CaseStudyPage);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  const headings = [...html.matchAll(/<h[12]\b[^>]*>(.*?)<\/h[12]>/g)].map((match) => match[1].replace(/<[^>]*>/g, '').trim());
  assert.deepEqual(headings, [
    'How We Rebuilt Lead and Quote Follow Up for Just About Cleaning',
    'What Changed in Their Daily Process',
    'Leads Were Coming In. Follow Ups Were Falling Through.',
    'Where the Existing Process Was Breaking Down',
    'A Clearer System for Every Lead and Quote',
    'How the Follow Up Process Works Now',
    'Less Guesswork. Better Visibility. More Consistent Follow Up.',
    'Tools Used in the Rebuild',
    'Where Are Your Leads Getting Stuck?',
    'See More of Our Work',
  ]);
  assert.ok(html.indexOf('aria-label="Breadcrumb"') < html.indexOf('<h1'));
  assert.ok(html.indexOf('aria-label="Project facts"') < html.indexOf('id="process-changes"'));
  assert.equal((html.match(/<dt[^>]*>Before<\/dt>/g) ?? []).length, 4);
  assert.equal((html.match(/<dt[^>]*>After the rebuild<\/dt>/g) ?? []).length, 4);
  assert.match(html, /md:grid-cols-2/);
  assert.doesNotMatch(html, /<table|<blockquote|undefined|\*\*|localhost|text-3xl font-semibold text-accent|aria-label="Campaign snapshot"/);
});

test('historical numbers stay in context and follow-up has distinct accepted and pending branches', () => {
  const html = renderPage(storyPath, '/our-work/:slug', CaseStudyPage);
  const contextStart = html.indexOf('aria-label="Historical campaign context"');
  const contextEnd = html.indexOf('</aside>', contextStart);
  const historical = html.slice(contextStart, contextEnd);
  assert.match(historical, /\$1,000/);
  assert.match(historical, /10 leads, but zero calls and zero completed forms/);
  assert.match(historical, /Historical campaign snapshot from the project brief; it does not measure performance after the rebuild\./);
  assert.equal((html.match(/\$1,000/g) ?? []).length, 1);
  assert.match(html, /If accepted/);
  assert.match(html, /If pending/);
  assert.match(html, /When the lead replies → automated messages stop/);
  assert.match(html, /Phone and Bark leads use the separate manual entry flow/);
  assert.match(html, /Other enquiry sources included Bark and phone calls\./);
  assert.match(html, /operational improvements delivered, not claims about financial results after launch/);
  assert.doesNotMatch(html, /Illustrative image/);
  assert.doesNotMatch(html, /AI-powered|zero leads lost|hours saved|more bookings|recovered revenue/);
});

test('breadcrumbs, audit, scheduling and the final back link use existing internal destinations', () => {
  const html = renderPage(storyPath, '/our-work/:slug', CaseStudyPage);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/our-work"/);
  assert.match(html, /aria-current="page"[^>]*>Just About Cleaning<\/li>/);
  assert.ok(html.includes(`href="${AUDIT_PATH}"`));
  assert.ok(html.includes(`href="${BOOKING_PATH}"`));
  assert.match(html, /Run My Free Audit/);
  assert.match(html, /Schedule a Call/);
  assert.ok(html.indexOf('Where Are Your Leads Getting Stuck?') < html.indexOf('Back to all work'));
  assert.equal(study.details?.seoTitle, 'Just About Cleaning CRM Rebuild | Invent Tomorrow');
});

test('related work shows at most two real published stories after the CTA and before the back link', () => {
  const fixture = (slug: string, isReal: boolean, isPublished: boolean): CaseStudy => ({ ...study, slug, title: slug, isReal, isPublished });
  withStudySet([
    study,
    fixture('draft-client-story', true, false),
    fixture('example-story', false, true),
    fixture('published-client-one', true, true),
    fixture('published-client-two', true, true),
    fixture('published-client-three', true, true),
  ], () => {
    const html = renderPage(storyPath, '/our-work/:slug', CaseStudyPage);
    assert.match(html, /See More of Our Work/);
    assert.match(html, /href="\/our-work\/published-client-one"/);
    assert.match(html, /href="\/our-work\/published-client-two"/);
    assert.doesNotMatch(html, /draft-client-story|example-story|published-client-three/);
    assert.ok(html.indexOf('Where Are Your Leads Getting Stuck?') < html.indexOf('See More of Our Work'));
    assert.ok(html.indexOf('See More of Our Work') < html.indexOf('Back to all work'));
  });
});

test('related work is omitted when no other real published story is available', () => {
  withStudySet([study], () => {
    assert.doesNotMatch(renderPage(storyPath, '/our-work/:slug', CaseStudyPage), /See More of Our Work/);
  });
});

test('the recovery story displays the supplied campaign outcome without borrowing unsupported workflow facts', () => {
  const html = renderPage(recoveryPath, '/our-work/:slug', CaseStudyPage);
  const story = html.slice(0, html.indexOf('See More of Our Work'));
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(story, /How 200 Old Leads Became 18 Closed Jobs/);
  assert.match(story, /aria-label="Campaign snapshot"/);
  assert.match(story, /Old leads worked/);
  assert.match(story, /Jobs closed/);
  assert.match(story, /9%/);
  assert.match(story, /automated email follow ups/i);
  assert.match(story, /Run My Free Audit/);
  assert.doesNotMatch(story, /process-changes|audit-findings|follow-up-process|Historical campaign context|GoHighLevel|Xero|\$1,000|<blockquote|undefined|Illustrative image/);
  assert.match(story, /alt="Stock photo of an office worker using a phone and laptop at a desk\."/);
  for (const src of [recoveryStudy.image!.src, recoveryStudy.image!.coverSrc!]) {
    assert.ok(existsSync(new URL(`../../public${src}`, import.meta.url)), src);
  }
});

test('both real stories appear in the existing grid and link to each other as related work', () => {
  const listing = renderPage('/our-work', '/our-work', OurWorkPage);
  assert.ok(listing.includes(`href="${storyPath}"`));
  assert.ok(listing.includes(`href="${recoveryPath}"`));
  assert.match(listing, /grid grid-cols-1 gap-5 md:grid-cols-2/);
  assert.equal((listing.match(/View case study/g) ?? []).length, 2);
  assert.doesNotMatch(listing, /aria-label="Campaign snapshot"|<dd/);
  assert.ok(renderPage(storyPath, '/our-work/:slug', CaseStudyPage).includes(`href="${recoveryPath}"`));
  assert.ok(renderPage(recoveryPath, '/our-work/:slug', CaseStudyPage).includes(`href="${storyPath}"`));
});

test('existing case study records keep their fallback template and unknown slugs stay not found', () => {
  withStudies([{ ...study, slug: 'existing-client-story', title: 'Existing client story', preview: undefined, details: undefined, metrics: [{ value: '5', label: 'Verified measure' }] }], () => {
    const html = renderPage('/our-work/existing-client-story', '/our-work/:slug', CaseStudyPage);
    assert.match(html, /Existing client story/);
    assert.match(html, /Verified measure/);
    assert.match(html, /Run My Audit/);
    assert.doesNotMatch(html, /Run My Free Audit/);
  });
  assert.match(renderPage('/our-work/unknown-story', '/our-work/:slug', CaseStudyPage), /not found|find that page/i);
});

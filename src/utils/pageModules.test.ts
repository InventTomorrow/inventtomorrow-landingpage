import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageKey } from './pageModules';
import { getSitePages } from './seo';

test('every prerendered route maps to a real page module', () => {
  for (const { meta } of getSitePages()) assert.notEqual(getPageKey(meta.path), 'NotFoundPage', meta.path);
});

test('page modules resolve booking anchors, aliases, trailing slashes and deep links', () => {
  assert.equal(getPageKey('/contact#book-or-message'), 'ContactPage');
  assert.equal(getPageKey('/about/?campaign=test'), 'AboutPage');
  assert.equal(getPageKey('/free-leak-audit'), 'FreeAuditPage');
  assert.equal(getPageKey('/free-audit-ads/?utm_source=ads'), 'FreeAuditAdsPage');
  assert.equal(getPageKey('/case-studies'), 'OurWorkPage');
  assert.equal(getPageKey('/our-work/just-about-cleaning-crm-automation-rebuild'), 'CaseStudyPage');
  assert.equal(getPageKey('/blog/missed-calls'), 'BlogPostPage');
  assert.equal(getPageKey('/privacy'), 'LegalPage');
  assert.equal(getPageKey('/does-not-exist'), 'NotFoundPage');
});

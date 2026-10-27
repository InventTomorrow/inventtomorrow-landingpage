import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveSectionId, SectionPosition } from './scrollspy';

const MOCK_SECTIONS: SectionPosition[] = [
  { id: 'home', top: 0, bottom: 800 },
  { id: 'how-it-works', top: 800, bottom: 1600 },
  { id: 'services', top: 1600, bottom: 2400 },
  { id: 'who-we-help', top: 2400, bottom: 3200 },
  { id: 'faqs', top: 3200, bottom: 4000 },
];

test('getActiveSectionId identifies home near the top', () => {
  assert.equal(getActiveSectionId(0, MOCK_SECTIONS, 100), 'home');
  assert.equal(getActiveSectionId(400, MOCK_SECTIONS, 100), 'home');
});

test('getActiveSectionId identifies how-it-works when scrolled past 800', () => {
  assert.equal(getActiveSectionId(750, MOCK_SECTIONS, 100), 'how-it-works');
  assert.equal(getActiveSectionId(1000, MOCK_SECTIONS, 100), 'how-it-works');
});

test('getActiveSectionId identifies services when scrolled past 1600', () => {
  assert.equal(getActiveSectionId(1550, MOCK_SECTIONS, 100), 'services');
});

test('getActiveSectionId defaults to home for empty array', () => {
  assert.equal(getActiveSectionId(500, []), 'home');
});

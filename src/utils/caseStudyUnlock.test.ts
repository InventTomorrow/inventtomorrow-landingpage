import assert from 'node:assert/strict';
import test from 'node:test';
import { CASE_STUDY_UNLOCK_KEY, isCaseStudyUnlocked, markCaseStudyUnlocked, type UnlockStorage } from './caseStudyUnlock';

function memoryStorage(initial: Record<string, string> = {}): UnlockStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: (key) => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
}

const blocked: UnlockStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
};

test('case studies start locked and stay unlocked once marked', () => {
  const storage = memoryStorage();
  assert.equal(isCaseStudyUnlocked(storage), false);
  markCaseStudyUnlocked(storage);
  assert.equal(storage.data[CASE_STUDY_UNLOCK_KEY], '1');
  assert.equal(isCaseStudyUnlocked(storage), true);
});

test('only the exact unlock flag counts', () => {
  assert.equal(isCaseStudyUnlocked(memoryStorage({ [CASE_STUDY_UNLOCK_KEY]: 'true' })), false);
  assert.equal(isCaseStudyUnlocked(memoryStorage({ [CASE_STUDY_UNLOCK_KEY]: '' })), false);
});

test('blocked storage never throws and reads as locked', () => {
  assert.equal(isCaseStudyUnlocked(blocked), false);
  assert.doesNotThrow(() => markCaseStudyUnlocked(blocked));
});

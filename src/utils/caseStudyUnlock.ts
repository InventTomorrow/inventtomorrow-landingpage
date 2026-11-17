import { useSyncExternalStore } from 'react';

export type UnlockStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const CASE_STUDY_UNLOCK_KEY = 'invo-casestudy-unlock:v1';

export function isCaseStudyUnlocked(storage: UnlockStorage): boolean {
  try { return storage.getItem(CASE_STUDY_UNLOCK_KEY) === '1'; }
  catch { return false; /* blocked storage: stay locked */ }
}

export function markCaseStudyUnlocked(storage: UnlockStorage): void {
  try { storage.setItem(CASE_STUDY_UNLOCK_KEY, '1'); }
  catch { /* blocked storage: the in-memory flag below still unlocks this visit */ }
}

// One unlock opens every case study. The in-memory flag covers browsers that block storage.
let memoryUnlocked = false;
const listeners = new Set<() => void>();

function readUnlocked(): boolean {
  if (memoryUnlocked) return true;
  if (typeof window === 'undefined') return false;
  try { return isCaseStudyUnlocked(window.localStorage); }
  catch { return false; }
}

export function unlockCaseStudies(): void {
  memoryUnlocked = true;
  if (typeof window !== 'undefined') {
    try { markCaseStudyUnlocked(window.localStorage); } catch { /* ignore */ }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === CASE_STUDY_UNLOCK_KEY) listener(); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

// The server snapshot is always locked, so prerendered HTML never contains the gated text
// and hydration matches; returning visitors unlock right after hydration.
export function useCaseStudiesUnlocked(): boolean {
  return useSyncExternalStore(subscribe, readUnlocked, () => false);
}

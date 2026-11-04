import { useEffect, useState } from 'react';

const MIN_VISIBLE_MS = 600;
const GIVE_UP_MS = 4000;

function whenPageLoaded() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
}

// True once the page and its fonts have loaded. Never earlier than MIN_VISIBLE_MS, so the loader doesn't flash.
export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let isCancelled = false;

    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt));
      window.setTimeout(() => !isCancelled && setIsReady(true), wait);
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.all([whenPageLoaded(), fontsReady]).then(finish, finish);
    const giveUp = window.setTimeout(() => !isCancelled && setIsReady(true), GIVE_UP_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(giveUp);
    };
  }, []);

  return isReady;
}

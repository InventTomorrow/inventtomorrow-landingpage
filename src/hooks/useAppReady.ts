import { useEffect, useState } from 'react';

const GIVE_UP_MS = 4000;

function whenPageLoaded() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
}

// Release as soon as the page and fonts are ready; never hold a loaded page behind branding.
export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const finish = () => {
      if (!isCancelled) setIsReady(true);
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

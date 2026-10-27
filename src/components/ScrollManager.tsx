import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { jumpTo, smoothScrollTo } from '../utils/smoothScroll';

// New page: start at the top. Link with a #hash (e.g. /contact#book-or-message): glide to that part.
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const newPage = lastPath.current !== pathname;
    lastPath.current = pathname;
    if (newPage) jumpTo(0);
    if (!hash) return;

    // Wait a frame so the new page is on screen before looking for the target.
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) smoothScrollTo(target);
    });
    return () => cancelAnimationFrame(frame);
    // `key` changes on every click, so the same #hash link works more than once.
  }, [pathname, hash, key]);

  return null;
}

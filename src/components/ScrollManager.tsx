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

    // A page loaded on demand may mount after the first frame.
    const targetId = decodeURIComponent(hash.slice(1));
    let frame: number;
    const observer = new MutationObserver(() => {
      if (!document.getElementById(targetId)) return;
      observer.disconnect();
      frame = requestAnimationFrame(scrollToTarget);
    });
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (target) {
        observer.disconnect();
        smoothScrollTo(target);
      } else {
        observer.observe(document.querySelector('main') ?? document.body, { childList: true, subtree: true });
      }
    };
    frame = requestAnimationFrame(scrollToTarget);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // `key` changes on every click, so the same #hash link works more than once.
  }, [pathname, hash, key]);

  return null;
}

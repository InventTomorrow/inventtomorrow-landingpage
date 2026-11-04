import { useEffect, useState } from 'react';

// True once the page has been scrolled more than `threshold` px from the top.
export function useIsScrolled(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return isScrolled;
}

import { ReactNode } from 'react';
import { Link } from 'react-router';
import { prefetchPage } from '../pages/lazyPages';

export const textLinkClass =
  'font-semibold text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:text-accent-hover hover:decoration-accent';

// An underlined accent link to another page.
export function TextLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`${textLinkClass} ${className}`} onPointerEnter={() => prefetchPage(to)} onFocus={() => prefetchPage(to)}>
      {children}
    </Link>
  );
}

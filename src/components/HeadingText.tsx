import type { ReactNode } from 'react';

interface HeadingTextProps {
  children: ReactNode;
  accent?: ReactNode;
  accentClassName?: string;
}

// Keep authored phrase splits; plain headings emphasize their second half.
export function HeadingText({ children, accent, accentClassName = 'text-accent' }: HeadingTextProps) {
  if (accent !== undefined && accent !== null) {
    return <>{children}{' '}<em className={`italic ${accentClassName}`}>{accent}</em></>;
  }

  if (typeof children !== 'string') return <>{children}</>;
  const words = [...children.matchAll(/\S+/g)];
  if (words.length < 2) return <>{children}</>;
  const splitAt = words[Math.ceil(words.length / 2)].index;

  return <>{children.slice(0, splitAt)}<em className={`italic ${accentClassName}`}>{children.slice(splitAt)}</em></>;
}

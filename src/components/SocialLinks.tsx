import { SOCIAL_LINKS } from '../content/social';

interface SocialLinksProps {
  size?: 'sm' | 'md';
  // Rounded squares instead of circles
  isSquare?: boolean;
  className?: string;
}

const SIZES = {
  sm: { button: 'h-7 w-7', icon: 'h-3.5 w-3.5' },
  md: { button: 'h-10 w-10', icon: 'h-[1.125rem] w-[1.125rem]' },
};

export function SocialLinks({ size = 'md', isSquare = false, className = '' }: SocialLinksProps) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map(({ id, label, url, icon: Icon }) => (
        <li key={id}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`flex items-center justify-center ${isSquare ? 'rounded-xs bg-white/10' : 'rounded-full'} border border-white/20 text-white/80 transition-colors hover:border-accent hover:bg-accent hover:text-on-primary ${SIZES[size].button}`}
          >
            <Icon className={SIZES[size].icon} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

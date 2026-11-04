import { Link } from 'react-router';

interface BrandLogoProps {
  // White text and a blue mark, for navy backgrounds
  isOnDark?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BrandLogo({ isOnDark = false, onClick, className = '' }: BrandLogoProps) {
  return (
    <Link to="/" onClick={onClick} aria-label="Invent Tomorrow home" className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex size-10 items-center justify-center rounded-xs text-sm font-bold text-on-primary ${isOnDark ? 'bg-accent' : 'bg-primary'}`}
      >
        IT
      </span>
      <span className={`whitespace-nowrap font-display text-xl font-bold ${isOnDark ? 'text-white' : 'text-primary'}`}>Invent Tomorrow</span>
    </Link>
  );
}

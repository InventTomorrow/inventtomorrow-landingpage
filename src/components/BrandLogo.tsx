import { Link } from 'react-router';
import { BrandLogoImage } from './BrandLogoImage';

interface BrandLogoProps {
  // White wordmark, for navy backgrounds
  isOnDark?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BrandLogo({ isOnDark = false, onClick, className = '' }: BrandLogoProps) {
  return (
    <Link to="/" onClick={onClick} aria-label="Invent Tomorrow home" className={`flex min-w-0 items-center gap-2 sm:gap-2.5 ${className}`}>
      <BrandLogoImage isOnDark={isOnDark} />
    </Link>
  );
}

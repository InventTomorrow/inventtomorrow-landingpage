import { ArrowLeft, ArrowRight } from 'lucide-react';

interface RoundArrowButtonProps {
  direction: 'previous' | 'next';
  onClick: () => void;
  isDisabled?: boolean;
  label: string;
}

// Compact outlined arrow with a blue fill on hover.
export function RoundArrowButton({ direction, onClick, isDisabled = false, label }: RoundArrowButtonProps) {
  const Icon = direction === 'previous' ? ArrowLeft : ArrowRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-paper text-accent shadow-sm transition-colors duration-200 enabled:hover:border-accent enabled:hover:bg-accent enabled:hover:text-on-primary motion-reduce:transition-none disabled:opacity-40 cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

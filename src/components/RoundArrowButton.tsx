import { ArrowLeft, ArrowRight } from 'lucide-react';

interface RoundArrowButtonProps {
  direction: 'previous' | 'next';
  onClick: () => void;
  isDisabled?: boolean;
  label: string;
}

// Round blue arrow. On hover the navy fill drops in from the top.
export function RoundArrowButton({ direction, onClick, isDisabled = false, label }: RoundArrowButtonProps) {
  const Icon = direction === 'previous' ? ArrowLeft : ArrowRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={label}
      className="relative isolate flex size-14 items-center justify-center overflow-hidden rounded-full bg-accent text-on-primary transition-opacity duration-300 before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:ease-out enabled:hover:before:scale-y-100 motion-reduce:before:transition-none disabled:opacity-40 cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}

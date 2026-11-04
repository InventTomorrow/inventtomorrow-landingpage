// "01" on a white tab: a thin blue border on the top and sides, a thicker bar underneath.
export function StepNumber({ number, className = '' }: { number: number; className?: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center justify-center rounded-t-2xl border border-b-4 border-accent/40 border-b-accent bg-paper px-4 pb-1 pt-2 font-display text-3xl font-semibold leading-none text-accent ${className}`}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
}

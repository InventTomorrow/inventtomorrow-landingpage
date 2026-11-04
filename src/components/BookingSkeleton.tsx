const CALENDAR_CELLS = Array.from({ length: 28 }, (_, index) => index);

interface BookingSkeletonProps {
  isVisible: boolean;
}

// Placeholder shaped like the booking widget, shown until its iframe has loaded.
export function BookingSkeleton({ isVisible }: BookingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 grid grid-cols-1 gap-8 bg-paper p-6 transition-opacity duration-500 sm:p-10 md:grid-cols-[2fr_3fr] ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="skeleton h-16 w-16 rounded-full" />
        <div className="skeleton h-4 w-40 rounded-full" />
        <div className="skeleton h-8 w-64 max-w-full rounded-full" />
        <div className="skeleton mt-4 h-4 w-24 rounded-full" />
        <div className="skeleton h-4 w-56 max-w-full rounded-full" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="skeleton h-7 w-56 rounded-full" />
        <div className="grid grid-cols-7 gap-3 sm:gap-5">
          {CALENDAR_CELLS.map((cell) => (
            <div key={cell} className="skeleton mx-auto aspect-square w-full max-w-11 rounded-full" />
          ))}
        </div>
        <div className="skeleton h-4 w-48 rounded-full" />
      </div>
    </div>
  );
}

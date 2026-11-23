interface ChangeRowProps {
  before: string;
  after: string;
}

export function ChangeRow({ before, after }: ChangeRowProps) {
  return (
    <li className="border-t border-border py-5 sm:py-6">
      <dl className="grid gap-4 sm:grid-cols-2 sm:gap-10">
        <div className="min-w-0">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-body sm:sr-only">Before</dt>
          <dd className="text-base leading-relaxed text-body">{before}</dd>
        </div>
        <div className="min-w-0">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent sm:sr-only">After</dt>
          <dd className="text-base font-semibold leading-relaxed text-primary">{after}</dd>
        </div>
      </dl>
    </li>
  );
}

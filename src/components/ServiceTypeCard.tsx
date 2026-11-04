import { Plus, type LucideIcon } from 'lucide-react';
import { SiteImage } from './SiteImage';

interface ServiceTypeCardProps {
  title: string;
  text: string;
  tags: string[];
  icon: LucideIcon;
}

// One kind of cleaning business. The card shows a short summary; hovering or focusing it slides up the full text and
// everything it covers over the card, so the card never changes size.
export function ServiceTypeCard({ title, text, tags, icon: Icon }: ServiceTypeCardProps) {
  return (
    <article
      tabIndex={0}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-paper transition-colors duration-300 hover:border-accent focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative">
        <SiteImage alt={title} label={title} width={480} height={300} className="rounded-none" />
        <span className="absolute -bottom-7 left-6 flex size-14 items-center justify-center rounded-xs border-4 border-paper bg-accent text-on-primary">
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>

      <div className="flex min-h-44 flex-col p-7 pt-11">
        <h3 className="text-xl font-semibold leading-snug text-primary">{title}</h3>
        <p className="mt-2 line-clamp-2 text-base" aria-hidden="true">
          {text}
        </p>
        <span className="mt-auto flex size-8 items-center justify-center self-end rounded-full bg-accent-soft text-accent" aria-hidden="true">
          <Plus className="h-4 w-4" />
        </span>
      </div>

      <div className="absolute inset-0 flex translate-y-full flex-col justify-end bg-hero-soft p-7 transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 motion-reduce:translate-y-0 motion-reduce:opacity-0 motion-reduce:transition-opacity motion-reduce:group-focus-within:opacity-100 motion-reduce:group-hover:opacity-100">
        <p className="font-display text-xl font-semibold leading-snug text-primary">{title}</p>
        <p className="mt-2 text-base">{text}</p>
        <ul className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full border border-border bg-paper px-3 py-1 text-sm text-primary">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

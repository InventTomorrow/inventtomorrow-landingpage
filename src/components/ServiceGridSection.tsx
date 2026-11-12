import { Link } from 'react-router';
import { SERVICE_CATALOG, SERVICE_GROUPS } from '../content/serviceCatalog';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { ServiceOverviewCard } from './ServiceOverviewCard';

// All services, grouped by the stage of the customer journey they support.
export function ServiceGridSection() {
  return (
    <Section bg="paper" id="service-list" width="max-w-7xl" hasDivider={false}>
      <SectionHeading
        eyebrow="What we set up"
        title="Every step covered." titleMuted="One less thing to chase."
        subtitle="Seven core services, with optional add-ons for the way you work. We build them, write the messages and run them for you."
      />
      <nav aria-label="Service categories" className="mt-8 flex flex-wrap justify-center gap-2">
        {SERVICE_GROUPS.map((group) => <Link key={group.id} to={`#${group.id}`} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{group.title}</Link>)}
      </nav>
      <div className="mt-14 space-y-14">
        {SERVICE_GROUPS.map((group, index) => (
          <div key={group.id} id={group.id}>
            <div className="mb-6 flex items-start gap-4 border-t border-border pt-7">
              <span className="font-display text-3xl font-semibold text-accent/50" aria-hidden="true">0{index + 1}</span>
              <div><h3 className="text-2xl font-semibold text-primary">{group.title}</h3><p className="mt-1 text-base text-ink">{group.description}</p></div>
            </div>
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {SERVICE_CATALOG.filter((service) => service.group === group.title).map((service) => <li key={service.path}><ServiceOverviewCard service={service} /></li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

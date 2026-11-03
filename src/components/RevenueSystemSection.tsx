import { useRef } from 'react';
import { FIXES } from '../content/fixes';
import { useScrollAccordion } from '../hooks/useScrollAccordion';
import { AUDIT_PATH } from '../utils/navigation';
import { FixAccordionRow } from './FixAccordionRow';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

interface RevenueSystemSectionProps {
  // Home page: adds a link to the full Services page
  showMoreLink?: boolean;
}

export function RevenueSystemSection({ showMoreLink = false }: RevenueSystemSectionProps) {
  const stackRef = useRef<HTMLOListElement>(null);
  const { activeIndex, hasStarted, scrollToRow } = useScrollAccordion(stackRef, FIXES.length);

  return (
    <section id="services" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-paper section-y px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The system"
          title="Meet the Revenue Recovery System"
          subtitle="Seven fixes that plug every leak. We build them, write them and run them."
        />

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="h-px bg-linear-to-r from-transparent via-ink/20 to-transparent" aria-hidden="true" />
          {/* Always one open panel plus the closed rows tall, so opening and closing never shifts the page */}
          <ol
            ref={stackRef}
            style={{ height: `calc(${FIXES.length} * var(--row-h) + var(--panel-h))` }}
            className="overflow-hidden [--panel-h:35rem] [--row-h:6rem] sm:[--panel-h:31rem]"
          >
            {FIXES.map((fix, index) => (
              <FixAccordionRow
                key={fix.title}
                fix={fix}
                index={index}
                isActive={index === activeIndex}
                hasStarted={hasStarted}
                onSelect={() => scrollToRow(index)}
              />
            ))}
          </ol>
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Not sure which you need? <TextLink to={AUDIT_PATH}>Your free audit shows which leak costs you the most</TextLink>
          {showMoreLink && (
            <>
              <span className="mx-3 text-ink/20" aria-hidden="true">
                |
              </span>
              <TextLink to="/services">See all services</TextLink>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

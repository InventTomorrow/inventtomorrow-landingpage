import { PageHero } from '../components/PageHero';
import { CtaButton } from '../components/CtaButton';
import { FaqSplitSection } from '../components/FaqSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { ALL_FAQS } from '../content/faq';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH } from '../utils/navigation';

export function FaqPage() {
  usePageMeta(
    'FAQ | Invent Tomorrow',
    'Straight answers about follow-up systems, your current tools, messages, pricing and setup.',
  );

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Fair questions."
        titleMuted="Straight answers."
        description="What your system handles and how you stay in control."
      >
        <CtaButton size="lg" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
      </PageHero>

      <FaqSplitSection faqs={ALL_FAQS} />

      <FinalCtaSection
        title="Still have a question?"
        body="Tell us what you need clarity on. We'll help you find the right next step."
        smallLine="No pressure. Just clear answers."
      />
    </>
  );
}

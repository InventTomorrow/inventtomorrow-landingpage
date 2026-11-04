import { House } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CtaButton } from '../components/CtaButton';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH } from '../utils/navigation';

export function NotFoundPage() {
  usePageMeta('Page not found | Invent Tomorrow', "This page doesn't exist.");

  return (
    <PageHero
      eyebrow="404"
      title="We couldn't find that page"
      description="It may have moved. Start from the home page, or book your free audit."
    >
      <CtaButton size="lg" variant="accent" to="/" icon={House}>
        Go to the home page
      </CtaButton>
      <CtaButton size="lg" variant="outline-light" to={AUDIT_PATH}>
        Run My Audit
      </CtaButton>
    </PageHero>
  );
}

import { ArrowRight, CalendarDays, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuditChat } from '../components/AuditChat';
import { AuditModal } from '../components/AuditModal';
import type { AuditFormValues } from '../components/AuditForm';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { FOUNDING_SPOTS_LEFT } from '../utils/freeAudit';
import styles from './FreeAuditPage.module.css';

export function FreeAuditPage({ isAds = false }: { isAds?: boolean } = {}) {
  usePageMeta(isAds ? PAGE_META.freeAuditAds : PAGE_META.freeAudit);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<Partial<AuditFormValues>>({});
  const openForm = (values: Partial<AuditFormValues> = {}) => {
    setFormValues(values);
    setFormOpen(true);
  };
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('book') === '1') setFormOpen(true);
  }, []);

  return (
    <section className={styles.page} aria-labelledby="free-audit-heading">
      <svg className={styles.curves} viewBox="0 0 1800 800" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 580C380 790 650 520 1090 440C1430 380 1650 190 1800 60V800H0Z" />
        <path d="M0 580C330 720 380 850 880 840C1320 830 1600 790 1800 600V800H0Z" />
      </svg>

      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Free 15-minute audit</span>
            <h1 id="free-audit-heading" className={styles.headline}>
              Find the jobs you're missing.
            </h1>
            <p className={styles.description}>
              In 15 minutes we'll count the missed calls, open quotes and past clients sitting in your business,
              and show you roughly what they're worth. Chat with Invo, our AI assistant, to book your audit or ask anything first.
            </p>
            <div className={styles.takeaways}>
              <h2>You'll leave knowing:</h2>
              <ul>
                {[
                  'How many calls, quotes and past clients are slipping away',
                  "Roughly what those jobs are worth each month",
                  'The first fix that would book you the most cleans',
                  'Whether you qualify for the Pays For Itself Guarantee',
                ].map((line) => <li key={line}><Check aria-hidden="true" /><span>{line}</span></li>)}
              </ul>
            </div>
          </div>

          <section className={styles.chat} aria-label="Free audit with Invo">
            <AuditChat key={isAds ? 'ads' : 'regular'} onBookAudit={openForm} pagePath={isAds ? '/free-audit-ads' : '/free-audit'} />
          </section>
        </div>

        <section className={styles.talk} aria-labelledby="free-audit-talk-heading">
          <div>
            <h2 id="free-audit-talk-heading">Rather talk to a person?</h2>
            <p className={styles.talkCopy}>Pick a time that suits you. We'll go through your calls, quotes and past clients together,
              and you'll leave with the number either way.</p>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => openForm()} aria-haspopup="dialog" className={styles.bookingButton}>
              <CalendarDays aria-hidden="true" /><span>Book a 15-minute call</span><ArrowRight aria-hidden="true" />
            </button>
            <p className={styles.chatHint}>Free, no pressure. {FOUNDING_SPOTS_LEFT} of 5 founding spots left.</p>
          </div>
        </section>
      </div>
      <AuditModal isOpen={formOpen} onClose={() => setFormOpen(false)} pagePath={isAds ? '/free-audit-ads' : '/free-audit'} initialValues={formValues} durationMinutes={15} />
    </section>
  );
}

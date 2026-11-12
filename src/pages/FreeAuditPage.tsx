import { ArrowRight, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { AuditChat } from '../components/AuditChat';
import { AuditModal } from '../components/AuditModal';
import type { AuditFormValues } from '../components/AuditForm';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './FreeAuditPage.module.css';

export function FreeAuditPage({ isAds = false }: { isAds?: boolean } = {}) {
  usePageMeta(isAds ? PAGE_META.freeAuditAds : PAGE_META.freeAudit);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<Partial<AuditFormValues>>({});
  const openForm = (values: Partial<AuditFormValues> = {}) => {
    setFormValues(values);
    setFormOpen(true);
  };

  return (
    <section className={styles.page} aria-label="Your free business audit">
      <svg className={styles.curves} viewBox="0 0 1800 800" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 580C380 790 650 520 1090 440C1430 380 1650 190 1800 60V800H0Z" />
        <path d="M0 580C330 720 380 850 880 840C1320 830 1600 790 1800 600V800H0Z" />
      </svg>

      <div className={styles.layout}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>For Cleaning Business Owners</span>
          <h1 className={styles.headline}>
            <span>Stop Losing Jobs to</span>{' '}
            <span>Missed Calls and</span>{' '}
            <span>Forgotten Follow-Ups.</span>
          </h1>
          <p className={styles.description}>
            We build systems that capture inquiries, follow up on quotes, and help turn more leads into booked jobs.
          </p>

          <div className={styles.actions}>
            <button type="button" onClick={() => openForm()} aria-haspopup="dialog" className={styles.bookingButton}>
              <CalendarDays aria-hidden="true" />
              <span>Book My Free Audit</span>
              <ArrowRight aria-hidden="true" />
            </button>
            <p className={styles.chatHint}>
              Or talk with Invo to get started
              <svg viewBox="0 0 130 52" aria-hidden="true" focusable="false">
                <path d="M4 42C48 50 88 38 119 8M101 10L122 5L117 25" />
              </svg>
            </p>
          </div>
        </div>

        <div className={styles.chat}>
          <AuditChat key={isAds ? 'ads' : 'regular'} onBookAudit={openForm} pagePath={isAds ? '/free-audit-ads' : '/free-audit'} />
        </div>
      </div>
      <AuditModal isOpen={formOpen} onClose={() => setFormOpen(false)} pagePath={isAds ? '/free-audit-ads' : '/free-audit'} initialValues={formValues} />
    </section>
  );
}

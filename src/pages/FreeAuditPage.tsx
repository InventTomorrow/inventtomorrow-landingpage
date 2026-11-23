import { useEffect, useRef, useState } from 'react';
import { AuditModal } from '../components/AuditModal';
import { AuditScorecard } from '../components/AuditScorecard';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';
import { BUSINESS_AUDIT_STAGES } from '../utils/businessAudit';
import styles from './FreeAuditPage.module.css';

export function FreeAuditPage({ isAds = false }: { isAds?: boolean } = {}) {
  usePageMeta(isAds ? PAGE_META.freeAuditAds : PAGE_META.freeAudit);
  const [formOpen, setFormOpen] = useState(false);
  const [auditStarted, setAuditStarted] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('book') === '1') setFormOpen(true);
  }, []);

  return (
    <section className={styles.page} aria-label="Free cleaning business audit">
      {auditStarted ? (
        <AuditScorecard pagePath={isAds ? '/free-audit-ads' : '/free-audit'} onBackToIntro={() => {
          setAuditStarted(false);
          requestAnimationFrame(() => startButtonRef.current?.focus());
        }} />
      ) : (
        <div className={styles.intro}>
          <span className={styles.eyebrow}>Cleaning Business Audit</span>
          <h1 id="free-audit-heading" className={styles.headline}>
            Find out where your cleaning business <em>may be missing booking opportunities.</em>
          </h1>
          <p className={styles.description}>
            Answer 16 quick questions about how your business handles enquiries, quotes, and customer follow-ups.
          </p>
          <div className={styles.actions}>
            <button ref={startButtonRef} type="button" onClick={() => setAuditStarted(true)} className={styles.auditButton}>
              Start my free audit
            </button>
            <p className={styles.hint}>Free. 16 quick questions. Your full report by email.</p>
          </div>
          <ul className={styles.topics} aria-label="What your audit covers">
            {BUSINESS_AUDIT_STAGES.map((stage) => <li key={stage.id}>{stage.title}</li>)}
          </ul>
        </div>
      )}
      <AuditModal isOpen={formOpen} onClose={() => setFormOpen(false)} pagePath={isAds ? '/free-audit-ads' : '/free-audit'} durationMinutes={15} />
    </section>
  );
}

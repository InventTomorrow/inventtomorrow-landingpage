import { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router';
import { LockKeyhole, Mail } from 'lucide-react';
import type { BusinessAuditReport as Report } from '../utils/businessAudit';
import { BOOKING_PATH } from '../utils/navigation';
import styles from './BusinessAuditReport.module.css';

export function BusinessAuditReport({ report, email, reportEmailSent, onReview }: {
  report: Report;
  email: string;
  reportEmailSent: boolean;
  onReview: () => void;
}) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <article className={styles.report} aria-labelledby={`${id}-title`} data-audit-results>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Invent Tomorrow · Your business audit</p>
        <h1 ref={heading} tabIndex={-1} id={`${id}-title`}>Client Audit — {report.businessName}</h1>
        <p className={styles.caption}>Prepared with AI from your audit answers.</p>
      </header>

      <section className={styles.bigPicture} aria-labelledby={`${id}-picture`}>
        <h2 id={`${id}-picture`}>The Big Picture</h2>
        <p>{report.bigPicture}</p>
      </section>

      <section className={styles.section} aria-labelledby={`${id}-business`}>
        <h2 id={`${id}-business`}>Your Business</h2>
        <dl className={styles.profile}>
          <div><dt>Team size</dt><dd>{report.business.teamSize}</dd></div>
          <div><dt>Monthly enquiries</dt><dd>{report.business.monthlyEnquiries}</dd></div>
          <div><dt>Main lead sources</dt><dd>{report.business.leadSources.join(', ')}</dd></div>
          <div><dt>Standard clean price</dt><dd>{report.business.standardCleanPrice}</dd></div>
        </dl>
        <p>{report.business.overview}</p>
      </section>

      <section className={styles.section} aria-labelledby={`${id}-findings`}>
        <h2 id={`${id}-findings`}>What Your Answers Are Telling Us</h2>
        <div className={styles.findings}>
          {report.findings.slice(0, 2).map((finding, index) => (
            <section key={index} className={styles.finding} aria-labelledby={`${id}-finding-${index}`}>
              <h3 id={`${id}-finding-${index}`}>{finding.heading}</h3>
              <p>{finding.body}</p>
            </section>
          ))}
        </div>
      </section>

      <section className={styles.reportTeaser} aria-labelledby={`${id}-full-report`}>
        <div className={styles.reportPages} aria-hidden="true" inert data-blurred-report>
          {report.findings.slice(2).map((finding, index) => (
            <section key={index} className={styles.finding}>
              <h3>{finding.heading}</h3>
              <p>{finding.body}</p>
            </section>
          ))}
          <section className={styles.section}>
            <h2>Why This Matters</h2>
            <p>{report.whyThisMatters}</p>
          </section>
          <section className={styles.section}>
            <h2>Illustrative Opportunity</h2>
            <p>{report.illustrativeOpportunity}</p>
          </section>
          <section className={styles.section}>
            <h2>The Next Conversation</h2>
            <p>{report.nextConversation}</p>
          </section>
        </div>
        <h2 id={`${id}-full-report`} className={styles.reportCaption}>
          <LockKeyhole aria-hidden="true" />Full report by email
        </h2>
      </section>

      <div className={styles.emailNotice} role="status">
        <Mail aria-hidden="true" />
        <div>
          <h2>{reportEmailSent ? 'Your full report has been sent to your email.' : 'Your full report is ready for email.'}</h2>
          <p><strong>{email}</strong></p>
          <p>{reportEmailSent ? 'Check your inbox and spam folder to view the full report.' : 'Email delivery is awaiting confirmation.'}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onReview}>Review my answers</button>
        <Link to={BOOKING_PATH} className={styles.bookButton}>Book my free call</Link>
      </div>
    </article>
  );
}

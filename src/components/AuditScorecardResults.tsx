import { useEffect, useId, useRef } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { BOOKING_PATH } from '../utils/navigation';
import { HeadingText } from './HeadingText';
import type { ReadinessProblem, ReadinessResults } from '../utils/readinessScorecard';
import styles from './AuditScorecardResults.module.css';

export function AuditScorecardResults({ problems, results, email, reportEmailSent, onReview }: {
  problems: ReadinessProblem[];
  results: ReadinessResults;
  email: string;
  reportEmailSent: boolean;
  onReview: () => void;
}) {
  const id = useId();
  const resultsRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const visibleProblems = problems.slice(0, 2);
  const remainingProblems = problems.slice(2);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, []);

  return (
    <section ref={resultsRef} className={styles.results} aria-labelledby={`${id}-title`} data-audit-results>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Your AI readiness results</p>
        <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1} className={styles.headline}>
          Here's what's holding <em>your team back.</em>
        </h1>
      </header>

      <section className={styles.preview} aria-labelledby={`${id}-problems`}>
        <div className={styles.previewHeading}>
          <h2 id={`${id}-problems`}><HeadingText>Your biggest problems</HeadingText></h2>
          <span><LockKeyhole aria-hidden="true" />Full details by email</span>
        </div>
        <ol className={styles.problems}>
          {visibleProblems.map((problem, index) => (
            <li key={problem.id} className={styles.problem}>
              <span className={styles.rank} aria-hidden="true">{index + 1}</span>
              <div className={styles.problemContent}>
                <h3>{problem.title}</h3>
                <ul className={styles.findings} role="list">{problem.items.map((finding) => <li key={finding}>{finding}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>
        {problems.length === 0 && <p className={styles.noProblems}>Your answers did not flag any major process gaps. Your full report covers ways to keep strengthening your team.</p>}
      </section>

      <section className={styles.reportAccess} aria-labelledby={`${id}-report`}>
        <div className={styles.reportTeaser}>
          <div className={styles.reportPages} aria-hidden="true" inert>
            <div className={styles.scoreSection}>
              <h3>Your readiness scorecard</h3>
              <p className={styles.reportSummary}>Overall readiness: {results.overall}/100</p>
              {results.stages.map((stage) => (
                <div key={stage.id} className={styles.reportScore}>
                  <div><h4>{stage.title}</h4><span>{stage.score}/100</span></div>
                  <progress value={stage.score} max={100} />
                </div>
              ))}
            </div>
            <div className={styles.recommendationSection}>
              {remainingProblems.map((problem) => (
                <div key={problem.id} className={styles.reportFinding}>
                  <h3>{problem.title}</h3>
                  <ul>{problem.items.map((finding) => <li key={finding}>{finding}</li>)}</ul>
                </div>
              ))}
              <h3>Your recommended next steps</h3>
              <ol className={styles.reportRecommendations}>
                {results.opportunities.map((opportunity) => (
                  <li key={opportunity.id}><h4>{opportunity.title}</h4><p>{opportunity.recommendation}</p></li>
                ))}
              </ol>
            </div>
          </div>
          <h3 id={`${id}-report`} className={styles.reportCaption}>
            <LockKeyhole aria-hidden="true" />Full report by email
          </h3>
        </div>

        <div className={styles.emailNotice} role="status">
          <Mail aria-hidden="true" />
          <div>
            <h2>{reportEmailSent ? 'Your full report has been sent to your email.' : 'Your full report is ready.'}</h2>
            <p><strong>{email}</strong><span>{reportEmailSent ? 'Check your inbox and spam folder.' : 'Email delivery is awaiting confirmation.'}</span></p>
          </div>
        </div>
      </section>

      <footer className={styles.actions}>
        <p>Free <strong>30-minute</strong> results call</p>
        <div>
          <button type="button" className={styles.reviewButton} onClick={onReview}>Review my answers</button>
          <Link to={BOOKING_PATH} className={styles.bookButton}>Book my free call</Link>
        </div>
      </footer>
    </section>
  );
}

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import {
  BUSINESS_AUDIT_STAGES, isBusinessAuditStageComplete, isBusinessAuditAnswerValid,
  type BusinessAuditAnswers, type BusinessAuditReport as Report,
} from '../utils/businessAudit';
import { browserAttribution } from '../utils/attribution';
import { getBrowserSessionId, newSessionId } from '../utils/sessionId';
import { BusinessAuditReport } from './BusinessAuditReport';
import { HeadingText } from './HeadingText';
import styles from './AuditScorecard.module.css';

interface ContactDetails {
  name: string;
  email: string;
  businessName: string;
  role: string;
}

const TOTAL_STEPS = BUSINESS_AUDIT_STAGES.length + 1;

export function AuditScorecard({ pagePath, onBackToIntro }: { pagePath: string; onBackToIntro: () => void }) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BusinessAuditAnswers>({});
  const [contact, setContact] = useState<ContactDetails>({ name: '', email: '', businessName: '', role: '' });
  const [report, setReport] = useState<Report | null>(null);
  const [reportEmailSent, setReportEmailSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const submission = useRef({ key: '', id: '' });
  const stage = BUSINESS_AUDIT_STAGES[step];
  const title = stage?.title ?? 'Your business audit is one step away.';

  useEffect(() => { headingRef.current?.focus(); }, [step, report]);

  const back = () => {
    setError('');
    if (step === 0) onBackToIntro();
    else setStep((value) => value - 1);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    if (stage) {
      if (isBusinessAuditStageComplete(answers, step)) setStep((value) => value + 1);
      return;
    }
    const firstIncomplete = BUSINESS_AUDIT_STAGES.findIndex((_, index) => !isBusinessAuditStageComplete(answers, index));
    if (firstIncomplete !== -1) { setStep(firstIncomplete); return; }
    const key = JSON.stringify({ answers, contact });
    if (submission.current.key !== key) submission.current = { key, id: newSessionId() };
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'cleaning_business_audit', answers, ...contact, pagePath,
          submissionId: submission.current.id, sessionId: getBrowserSessionId(), tracking: browserAttribution() }),
        signal: AbortSignal.timeout(115_000),
      });
      const data = await response.json() as { success?: boolean; submissionId?: string; report?: Report; reportEmailSent?: boolean; error?: string };
      if (!response.ok || data.success !== true || data.submissionId !== submission.current.id || !data.report) throw new Error(data.error || "We couldn't prepare your report. Please try again.");
      setReport(data.report);
      setReportEmailSent(data.reportEmailSent === true);
    } catch (failure) {
      setError(failure instanceof Error && !['TimeoutError', 'AbortError', 'TypeError', 'SyntaxError'].includes(failure.name)
        ? failure.message : "We couldn't connect. Your answers are still here; please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  if (report) return <BusinessAuditReport report={report} email={contact.email.trim()} reportEmailSent={reportEmailSent} onReview={() => { setReport(null); setStep(0); }} />;

  return (
    <section className={styles.card} aria-labelledby={`${id}-title`}>
      <div className={styles.stepMeta}>
        <p className={styles.stageLabel}>Cleaning Business Audit</p>
        <p className={styles.stepCount}>{stage ? `Step ${step + 1} of ${BUSINESS_AUDIT_STAGES.length}` : 'Final details'}</p>
      </div>
      <progress className={styles.progress} value={step + 1} max={TOTAL_STEPS} aria-label="Audit progress" />
      <h1 id={`${id}-title`} ref={headingRef} tabIndex={-1} className={styles.heading}><HeadingText>{title}</HeadingText></h1>
      <form onSubmit={submit} aria-busy={pending}>
        {stage ? (
          <div key={stage.id} className={styles.questions}>
            {stage.questions.map((question, questionIndex) => {
              const questionId = `${id}-${question.id}`;
              const selected = answers[question.id];
              const selectedOptions = Array.isArray(selected) ? selected : [];
              return (
                <fieldset key={questionId} className={styles.question}>
                  <legend>{step * 4 + questionIndex + 1}. {question.text}</legend>
                  {question.maxSelections && <p id={`${questionId}-hint`} className={styles.questionHint}>Select up to two.</p>}
                  <div className={styles.options}>
                    {question.options.map((option, optionIndex) => (
                      <label key={option} className={styles.option}>
                        <input type={question.maxSelections ? 'checkbox' : 'radio'} name={questionId} value={option}
                          required={!question.maxSelections} checked={question.maxSelections ? selectedOptions.includes(option) : selected === option}
                          aria-describedby={question.maxSelections ? `${questionId}-hint` : undefined}
                          disabled={pending || (!!question.maxSelections && selectedOptions.length >= question.maxSelections && !selectedOptions.includes(option))}
                          onChange={() => setAnswers((current) => {
                            if (!question.maxSelections) return { ...current, [question.id]: option };
                            const previous = current[question.id];
                            const chosen = Array.isArray(previous) ? previous : [];
                            const next = chosen.includes(option) ? chosen.filter((item) => item !== option) : [...chosen, option];
                            return next.length <= question.maxSelections ? { ...current, [question.id]: next } : current;
                          })} />
                        <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        ) : (
          <>
            <fieldset disabled={pending} className={styles.contactFields} aria-label="Contact details">
              <div className={styles.field}>
                <label htmlFor={`${id}-name`}>Name</label>
                <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120} value={contact.name} onChange={(event) => setContact((value) => ({ ...value, name: event.target.value }))} />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-email`}>Work email</label>
                <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="name@company.com" required maxLength={254} value={contact.email} onChange={(event) => setContact((value) => ({ ...value, email: event.target.value }))} />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-company`}>Business name</label>
                <input id={`${id}-company`} name="businessName" autoComplete="organization" required maxLength={160} value={contact.businessName} onChange={(event) => setContact((value) => ({ ...value, businessName: event.target.value }))} />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${id}-role`}>Role</label>
                <input id={`${id}-role`} name="role" autoComplete="organization-title" required maxLength={120} value={contact.role} onChange={(event) => setContact((value) => ({ ...value, role: event.target.value }))} />
              </div>
            </fieldset>
            <p className={styles.notice}>Preview your findings on the next screen. Your full report is prepared for email. Read our <Link to="/privacy">privacy policy</Link>.</p>
            {pending && <p role="status" className={styles.notice}>We’re reviewing your 16 answers and preparing your personalized report. This can take up to a minute.</p>}
          </>
        )}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.navigation}>
          <button type="button" className={styles.backButton} onClick={back} disabled={pending}>Back</button>
          {stage && <p className={styles.answered} aria-live="polite">{stage.questions.filter((question) => isBusinessAuditAnswerValid(question, answers[question.id])).length} of {stage.questions.length} answered</p>}
          <button type="submit" className={styles.nextButton} disabled={pending || (!!stage && !isBusinessAuditStageComplete(answers, step))}>
            {stage ? 'Next' : pending ? 'Preparing your report…' : 'Get My Business Audit'}
          </button>
        </div>
      </form>
    </section>
  );
}

import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { HeadingText } from './HeadingText';
import { COMPANY_SIZE_OPTIONS, type AuditAnswers, type AuditEstimates } from '../utils/freeAudit';
import type { CompanySize } from '../utils/companySize';
import { auditAnswerKey, clearAuditDraft, newSessionId, readAuditDraft, writeAuditDraft, type AuditDraftFields, type ChatPagePath } from '../utils/chatSession';
import { setScrollLocked } from '../utils/smoothScroll';
import { formatUsPhoneInput, isValidUsPhone, normalizeWebsite, PHONE_ERROR, PHONE_PREFIX, WEBSITE_ERROR } from '../utils/contactChecks';
import styles from './AuditForm.module.css';

export function AuditResultsModal({ open, onClose, answers, pagePath, sessionId, tracking, knownCompanySize, onComplete }: {
  open: boolean;
  onClose: () => void;
  answers: AuditAnswers;
  pagePath: ChatPagePath;
  sessionId: string;
  tracking?: Record<string, string>;
  // Team size the visitor already told Invo in the chat: the form uses it instead of asking again.
  knownCompanySize?: CompanySize | null;
  onComplete: (results: AuditEstimates, contact: { email: string; phone: string }) => void;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const submissionId = useRef('');
  // The phone box starts as "+1 " (US numbers only) and keeps that prefix.
  const blank: AuditDraftFields = { email: '', phone: PHONE_PREFIX, website: '', companySize: '', noWebsite: false };
  const [fields, setFields] = useState<AuditDraftFields>(blank);
  // A field is only marked wrong after the visitor has left it, or has tried to submit.
  const [touched, setTouched] = useState({ phone: false, website: false });
  const [attempted, setAttempted] = useState(false);
  const [changingSize, setChangingSize] = useState(false);
  const companySize = fields.companySize || knownCompanySize || '';
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const answerKey = auditAnswerKey(answers);

  useEffect(() => {
    let draft = null;
    try { draft = readAuditDraft(window.localStorage, pagePath, sessionId, answers); } catch { /* blocked storage */ }
    submissionId.current = draft?.submissionId || '';
    setFields(draft ? { email: draft.email, phone: formatUsPhoneInput(draft.phone), website: draft.website,
      companySize: draft.companySize, noWebsite: draft.noWebsite }
      : { email: '', phone: PHONE_PREFIX, website: '', companySize: '', noWebsite: false });
    setTouched({ phone: false, website: false });
    setAttempted(false);
    setChangingSize(false);
    setError('');
  }, [answerKey, pagePath, sessionId]);

  const updateFields = (changes: Partial<AuditDraftFields>) => {
    const next = { ...fields, ...changes };
    setFields(next);
    submissionId.current ||= newSessionId();
    try { writeAuditDraft(window.localStorage, pagePath, { ...next, answers, sessionId, submissionId: submissionId.current }); } catch { /* blocked storage */ }
  };

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    dialogRef.current?.showModal();
    setScrollLocked(true);
    emailRef.current?.focus();
    return () => {
      dialogRef.current?.close();
      setScrollLocked(false);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  const phoneError = (touched.phone || attempted) && !isValidUsPhone(fields.phone) ? PHONE_ERROR : '';
  const websiteError = (touched.website || attempted) && !fields.noWebsite && !normalizeWebsite(fields.website) ? WEBSITE_ERROR : '';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    // The same rules the server applies, so the visitor sees what is wrong before anything is sent.
    if (!isValidUsPhone(fields.phone) || (!fields.noWebsite && !normalizeWebsite(fields.website))) {
      setAttempted(true);
      (!isValidUsPhone(fields.phone) ? phoneRef : websiteRef).current?.focus();
      return;
    }
    const email = fields.email.trim();
    const phone = fields.phone.trim();
    submissionId.current ||= newSessionId();
    try { writeAuditDraft(window.localStorage, pagePath, { ...fields, answers, sessionId, submissionId: submissionId.current }); } catch { /* blocked storage */ }
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'quick_audit', answers, email, phone, noWebsite: fields.noWebsite,
          website: fields.website.trim(), companySize,
          pagePath, sessionId, submissionId: submissionId.current, tracking }),
        signal: AbortSignal.timeout(15_000),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true || !data.results) throw new Error(data.error || "We couldn't send your details. Please try again.");
      onComplete(data.results, { email, phone });
      try { clearAuditDraft(window.localStorage, pagePath); } catch { /* blocked storage */ }
      onClose();
    } catch (failure) {
      setError(failure instanceof Error && !['TypeError', 'TimeoutError'].includes(failure.name)
        ? failure.message : "We couldn't connect. Your details are still here; please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  if (typeof document === 'undefined') return null;
  // Keep this dialog mounted when closed so typed fields survive reopening.
  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={`${id}-title`} data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={(event) => {
        if (pending || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <div className={styles.modalHeader}>
        <div>
          <h2 id={`${id}-title`}><HeadingText>Your audit is ready</HeadingText></h2>
          <p>Where should we send it? You'll see your results here straight away, and we'll email you a copy.</p>
        </div>
        <button type="button" onClick={onClose} disabled={pending} className={styles.close} aria-label="Close audit form"><X aria-hidden="true" /></button>
      </div>
      <form onSubmit={submit} className={styles.form} aria-label="Get your audit results" aria-busy={pending}>
        <fieldset className={styles.fields} disabled={pending}>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor={`${id}-email`}>Email</label>
            <input ref={emailRef} id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={(event) => updateFields({ email: event.target.value })} />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor={`${id}-phone`}>Phone number</label>
            <input ref={phoneRef} id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" aria-required="true" maxLength={20} placeholder="+1 (202) 234-5678"
              aria-invalid={phoneError ? true : undefined} aria-describedby={`${phoneError ? `${id}-phone-error ` : ''}${id}-consent`}
              value={fields.phone} onChange={(event) => updateFields({ phone: formatUsPhoneInput(event.target.value) })}
              onBlur={() => setTouched((value) => ({ ...value, phone: true }))} />
            {phoneError && <p id={`${id}-phone-error`} className={styles.fieldError} role="alert">{phoneError}</p>}
            <p id={`${id}-consent`} className={styles.fieldHelp}>By sharing your number you agree we can text you about your audit. Reply STOP to opt out.</p>
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor={`${id}-website`}>Website</label>
            {/* Text, not type="url": owners type "brighthome.com"; the server adds https://. */}
            <input ref={websiteRef} id={`${id}-website`} name="website" type="text" inputMode="url" autoComplete="url" autoCapitalize="none" spellCheck={false} aria-required={!fields.noWebsite} disabled={fields.noWebsite} maxLength={2048} placeholder="yourbusiness.com"
              aria-invalid={websiteError ? true : undefined} aria-describedby={websiteError ? `${id}-website-error` : undefined}
              value={fields.website} onChange={(event) => updateFields({ website: event.target.value })}
              onBlur={() => setTouched((value) => ({ ...value, website: true }))} />
            {websiteError && <p id={`${id}-website-error`} className={styles.fieldError} role="alert">{websiteError}</p>}
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={fields.noWebsite} onChange={(event) => updateFields({ noWebsite: event.target.checked })} /> No website yet
            </label>
          </div>
          {knownCompanySize && !changingSize ? (
            // Already answered in the chat, so it is not asked a second time.
            <p className={`${styles.fullWidth} ${styles.knownSize}`}>
              <span>Company size: <strong>{companySize}</strong></span>
              <button type="button" onClick={() => setChangingSize(true)}>Change</button>
            </p>
          ) : (
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor={`${id}-size`}>Company size</label>
              <select id={`${id}-size`} name="companySize" required value={companySize} onChange={(event) => updateFields({ companySize: event.target.value })}>
                <option value="" disabled>Select your company size</option>
                {COMPANY_SIZE_OPTIONS.map((size) => <option key={size}>{size}</option>)}
              </select>
            </div>
          )}
        </fieldset>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.submit} type="submit" disabled={pending}>{pending ? 'Sending your details…' : 'Show my audit'}</button>
        <p className={styles.note}>We never share your details. <a href="/privacy">Privacy policy</a></p>
      </form>
    </dialog>, document.body,
  );
}

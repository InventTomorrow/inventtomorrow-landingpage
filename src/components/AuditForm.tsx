import { CheckCircle2, Send } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { DEFAULT_APPOINTMENT_TIME_ZONE } from '../utils/appointment';
import { AppointmentPicker } from './AppointmentPicker';
import styles from './AuditForm.module.css';

export interface AuditFormValues {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  description: string;
  'appointment datetime': string;
  appointmentTimeZone: string;
}

export function AuditForm({ pagePath, initialValues = {}, autoFocus = false }: {
  pagePath: string;
  initialValues?: Partial<AuditFormValues>;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState(initialValues['appointment datetime'] ?? '');
  const [appointmentInvalid, setAppointmentInvalid] = useState(false);
  const submitting = useRef(false);
  const submissionId = useRef<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || submitted) return;
    if (!appointmentDateTime) {
      setAppointmentInvalid(true);
      return;
    }
    const data = new FormData(event.currentTarget);
    const details = Object.fromEntries(['name', 'businessName', 'email', 'phone', 'description', 'appointment datetime', 'appointmentTimeZone']
      .map((key) => [key, String(data.get(key) ?? '').trim()]));
    submissionId.current ??= typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID() : `form-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, submissionId: submissionId.current, pagePath }),
        signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json().catch(() => ({})) as { success?: boolean; error?: string };
      if (!response.ok || result.success !== true) throw new Error(result.error || "We couldn't send your request. Please try again.");
      setSubmitted(true);
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'TimeoutError' && failure.name !== 'TypeError'
        ? failure.message : "We couldn't send your request. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <div role="status" className={styles.success}>
        <CheckCircle2 aria-hidden="true" />
        <h3>Your audit request is received.</h3>
        <p>Our team will contact you to confirm your requested appointment time.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} aria-label="Free audit request" aria-busy={pending}>
      <fieldset disabled={pending} className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>Full name</label>
          <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120} defaultValue={initialValues.name} autoFocus={autoFocus} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-business`}>Business name</label>
          <input id={`${id}-business`} name="businessName" autoComplete="organization" required maxLength={160} defaultValue={initialValues.businessName} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>Email address</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={initialValues.email} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-phone`}>US phone number</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="(202) 234-5678" defaultValue={initialValues.phone} />
        </div>
        <div className={styles.fullWidth}>
          <AppointmentPicker
            value={appointmentDateTime}
            timeZone={DEFAULT_APPOINTMENT_TIME_ZONE}
            onChange={(value) => { setAppointmentDateTime(value); if (value) setAppointmentInvalid(false); }}
            invalid={appointmentInvalid}
          />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor={`${id}-description`}>What would you like help with? <span>(optional)</span></label>
          <textarea id={`${id}-description`} name="description" rows={3} maxLength={1000} defaultValue={initialValues.description} placeholder="Missed calls, quote follow-ups, old leads, repeat bookings…" />
        </div>
      </fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button type="submit" disabled={pending} className={styles.submit}>
        <Send aria-hidden="true" />
        {pending ? 'Sending your request…' : 'Send My Audit Request'}
      </button>
      <p className={styles.note}>We’ll use these details to follow up about your free audit.</p>
    </form>
  );
}

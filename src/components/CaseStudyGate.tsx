import { Loader2, Lock, Send } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { browserAttribution } from '../utils/attribution';
import { unlockCaseStudies, useCaseStudiesUnlocked } from '../utils/caseStudyUnlock';
import { formatUsPhoneInput, isValidUsPhone, PHONE_ERROR } from '../utils/contactChecks';
import { getBrowserSessionId } from '../utils/sessionId';

// How long the "confirming your email" state stays on screen, counted from the moment they submit.
export const UNLOCK_DELAY_MS = 6000;

const labelClass = 'mb-1.5 block text-sm font-semibold leading-normal';
const inputClass = 'w-full min-w-0 select-text rounded-xs border border-border bg-paper p-3 text-base leading-normal text-primary placeholder:text-body focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent aria-invalid:border-[#c0392b] aria-invalid:focus:outline-[#c0392b]';
const bar = 'h-3.5 rounded-full bg-border';
const block = 'grid gap-3 rounded-2xl border border-border bg-stone p-5';

function PreviewPlaceholder() {
  // Generic shapes only: the real text is not rendered until the visitor unlocks.
  return (
    <div className="pointer-events-none grid min-h-[34rem] select-none gap-5 opacity-85 blur-[7px]" aria-hidden="true">
      <div className="h-7 w-[55%] rounded-xs bg-primary/20" />
      <div className={block}>
        <div className={`${bar} w-[92%]`} /><div className={`${bar} w-[78%]`} /><div className={`${bar} w-[85%]`} />
      </div>
      <div className={block}>
        <div className={`${bar} w-[88%]`} /><div className={`${bar} w-[64%]`} /><div className={`${bar} w-[90%]`} />
      </div>
      <div className="h-7 w-[42%] rounded-xs bg-primary/20" />
      <div className={block}>
        <div className={`${bar} w-[80%]`} /><div className={`${bar} w-[95%]`} /><div className={`${bar} w-[58%]`} />
      </div>
    </div>
  );
}

function UnlockForm({ slug }: { slug: string }) {
  const id = useId();
  const [pending, setPending] = useState(false);
  // confirming: the form is hidden (not unmounted, so typed details survive an error) and the progress panel shows.
  const [confirming, setConfirming] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState(() => formatUsPhoneInput(''));
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const submissionId = useRef<string | null>(null);
  const mounted = useRef(true);
  const phoneError = phoneTouched && !isValidUsPhone(phone) ? PHONE_ERROR : '';

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Halfway through, the message moves on from checking the email to unlocking.
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setStep(1), UNLOCK_DELAY_MS * 0.5);
    return () => clearTimeout(timer);
  }, [confirming]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    if (!isValidUsPhone(phone)) {
      setPhoneTouched(true);
      phoneRef.current?.focus();
      return;
    }
    const data = new FormData(event.currentTarget);
    const details = Object.fromEntries(['name', 'businessName', 'email', 'phone']
      .map((key) => [key, String(data.get(key) ?? '').trim()]));
    // Reused on retry so the email sender can deduplicate an interrupted submission.
    submissionId.current ??= typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID() : `form-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    submitting.current = true;
    setPending(true);
    setError('');
    setStep(0);
    setConfirming(true);
    const startedAt = Date.now();
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...details, mode: 'case_study_unlock', caseStudySlug: slug, submissionId: submissionId.current,
          sessionId: getBrowserSessionId(), pagePath: `/our-work/${slug}`, tracking: browserAttribution(),
        }),
        signal: AbortSignal.timeout(25_000),
      });
      const result = await response.json().catch(() => ({})) as { success?: boolean; error?: string };
      if (!response.ok || result.success !== true) throw new Error(result.error || "We couldn't send your details. Please try again.");
      // Saved: reveal once the full delay (counted from submit) has passed.
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, UNLOCK_DELAY_MS - (Date.now() - startedAt))));
      unlockCaseStudies();
    } catch (failure) {
      if (mounted.current) {
        setConfirming(false);
        setError(failure instanceof Error && failure.name !== 'TimeoutError' && failure.name !== 'TypeError'
          ? failure.message : "We couldn't send your details. Please try again.");
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  };

  return (
    <>
    {confirming && (
      <div role="status" className="px-2 pb-2 pt-6 text-center">
        <Loader2 className="mx-auto mb-4 size-10 animate-spin text-accent motion-reduce:animate-none" aria-hidden="true" />
        <p className="text-xl font-bold leading-snug text-primary">{step === 0 ? 'Confirming your email…' : 'Unlocking your case study…'}</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ink">
          {step === 0 ? 'Hang tight while we check your details.' : 'Almost there. The full story opens in a moment.'}
        </p>
        <div className="mx-auto mt-5 h-2 max-w-sm overflow-hidden rounded-full bg-stone" aria-hidden="true">
          <div className="animate-unlock-fill h-full w-0 rounded-full bg-accent" style={{ '--unlock-ms': `${UNLOCK_DELAY_MS}ms` } as CSSProperties} />
        </div>
      </div>
    )}
    <form onSubmit={onSubmit} hidden={confirming} className="text-primary" aria-label="Unlock the full case study" aria-busy={pending}>
      <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 border-0 p-0 disabled:opacity-65 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor={`${id}-name`} className={labelClass}>Full name</label>
          <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120} className={inputClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-business`} className={labelClass}>Business name</label>
          <input id={`${id}-business`} name="businessName" autoComplete="organization" required maxLength={160} className={inputClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-email`} className={labelClass}>Email address</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-phone`} className={labelClass}>US phone number</label>
          <input ref={phoneRef} id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" aria-required="true" maxLength={20} placeholder="+1 (202) 234-5678" className={inputClass}
            aria-invalid={phoneError ? true : undefined} aria-describedby={phoneError ? `${id}-phone-error` : undefined}
            value={phone} onChange={(event) => setPhone(formatUsPhoneInput(event.target.value))} onBlur={() => setPhoneTouched(true)} />
          {phoneError && <p id={`${id}-phone-error`} className="mt-1.5 text-[0.8125rem] font-semibold leading-normal text-[#9b2525]" role="alert">{phoneError}</p>}
        </div>
      </fieldset>
      {error && <p role="alert" className="mt-4 rounded-xs border border-[#e2b5b5] bg-[#fff5f5] p-3 text-sm leading-normal text-[#9b2525]">{error}</p>}
      <button type="submit" disabled={pending} className="mt-5 flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xs bg-accent px-4 py-3.5 text-base font-bold leading-normal text-on-primary hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-65">
        <Send className="size-5 shrink-0" aria-hidden="true" />
        {pending ? 'Sending…' : 'Unlock Full Case Study'}
      </button>
      <p className="mt-3.5 text-center text-[0.8125rem] leading-normal text-ink">We’ll use these details to follow up about your free audit.</p>
    </form>
    </>
  );
}

/**
 * Renders `children` (the gated half of a case study) only once the visitor has unlocked.
 * Until then the page shows a blurred placeholder and the unlock form, so the real text is
 * not in the prerendered HTML or the DOM.
 */
export function CaseStudyGate({ slug, children, forceUnlocked = false }: { slug: string; children: ReactNode; forceUnlocked?: boolean }) {
  const unlocked = useCaseStudiesUnlocked();
  // Same vertical rhythm as the open sections above, since this wrapper is one child of the article.
  if (forceUnlocked || unlocked) return <div className={`space-y-16 sm:space-y-20${forceUnlocked ? '' : ' animate-unlock-reveal'}`}>{children}</div>;

  return (
    <div className="relative">
      <PreviewPlaceholder />
      <div className="absolute inset-0 flex items-start justify-center bg-linear-to-b from-paper/0 to-paper/95 to-90% pb-4">
        <section className="sticky top-22 mt-4 w-full max-w-xl rounded-3xl border border-border bg-paper p-5 text-primary shadow-float sm:p-6" aria-labelledby="unlock-case-study">
          <div className="mb-3 grid size-10 place-items-center rounded-full bg-stone text-accent"><Lock className="size-5" aria-hidden="true" /></div>
          <h2 id="unlock-case-study" className="font-display text-xl font-bold leading-tight text-balance sm:text-2xl">Unlock the full <em className="text-accent">case study</em></h2>
          <p className="mb-5 mt-2 text-[0.9375rem] leading-relaxed text-ink">See the rebuild, the follow up workflow and the tools we used. Enter your details and it opens right here.</p>
          <UnlockForm slug={slug} />
        </section>
      </div>
    </div>
  );
}

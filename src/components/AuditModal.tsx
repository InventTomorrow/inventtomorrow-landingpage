import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, PhoneCall, Building2 } from 'lucide-react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-xl border border-ink/15 bg-white py-3 text-sm text-ink placeholder-ink/35 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';
const labelClass = 'mb-2 block text-sm font-medium text-ink';

export function AuditModal({ isOpen, onClose }: AuditModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState('');
  const [software, setSoftware] = useState('Jobber');
  const [missedCallsPerWeek, setMissedCallsPerWeek] = useState(6);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Rough estimate: half of missed calls would have booked, at an average ticket of ~$250.
  const estimatedLostMonthly = Math.round(missedCallsPerWeek * 4 * 0.5 * 250);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setStep(1);
      onClose();
    }, 2800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Free follow-up audit"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 text-ink shadow-[0_24px_80px_rgba(15,27,45,0.25)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Free follow-up audit</h3>
                <p className="mt-1 text-sm text-muted">We test your business like a customer would, then share the numbers.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="mt-5 text-2xl font-bold">You're in.</h4>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  We'll run your test, then contact you to walk through the numbers.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-accent">Step {step} of 2</span>
                  <span>Free and confidential</span>
                </div>

                {step === 1 ? (
                  <>
                    <div>
                      <label htmlFor="audit-business" className={labelClass}>Business name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-ink/35" />
                        <input
                          id="audit-business"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Apex Maid & Cleaning"
                          className={`${inputClass} pl-10 pr-4`}
                        />
                      </div>
                    </div>

                    <div>
                      <span className={labelClass}>Booking software</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['Jobber', 'Housecall Pro', 'Other'].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSoftware(item)}
                            aria-pressed={software === item}
                            className={`rounded-xl border p-2.5 text-xs font-medium transition-colors cursor-pointer ${
                              software === item
                                ? 'border-accent bg-accent-soft text-ink'
                                : 'border-ink/15 text-muted hover:border-ink/30 hover:text-ink'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="audit-missed" className="text-sm font-medium text-ink">
                          Missed calls per week
                        </label>
                        <span className="text-sm font-semibold text-accent tabular-nums">{missedCallsPerWeek}</span>
                      </div>
                      <input
                        id="audit-missed"
                        type="range"
                        min="2"
                        max="30"
                        value={missedCallsPerWeek}
                        onChange={(e) => setMissedCallsPerWeek(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-ink/10 accent-accent"
                      />
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-stone px-4 py-3 text-sm">
                        <span className="text-muted">Estimated revenue lost each month</span>
                        <span className="font-bold text-ink tabular-nums">~${estimatedLostMonthly.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!businessName.trim()}
                      className="mt-2 flex h-11 w-full items-center justify-center rounded-lg border border-ink bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="audit-phone" className={labelClass}>Business phone number</label>
                      <div className="relative">
                        <PhoneCall className="absolute left-3.5 top-3.5 h-4 w-4 text-ink/35" />
                        <input
                          id="audit-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                          className={`${inputClass} pl-10 pr-4`}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-muted">We'll call it like a customer would to test your reply speed.</p>
                    </div>

                    <div>
                      <label htmlFor="audit-email" className={labelClass}>Where should we send your results?</label>
                      <input
                        id="audit-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourcleaningco.com"
                        className={`${inputClass} px-4`}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-11 rounded-lg border border-ink/15 px-5 text-sm font-medium text-ink transition-colors hover:bg-ink/5 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="h-11 flex-1 rounded-lg border border-[#2552bb] bg-accent text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(15,27,45,0.22)] transition-colors hover:bg-accent-hover cursor-pointer"
                      >
                        Get my free audit
                      </button>
                    </div>
                    <p className="text-center text-xs text-muted">No contract. No pressure. Just the numbers.</p>
                  </>
                )}
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

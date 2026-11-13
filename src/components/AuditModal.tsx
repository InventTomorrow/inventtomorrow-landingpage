import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { setScrollLocked } from '../utils/smoothScroll';
import { AuditForm, type AuditFormValues } from './AuditForm';
import styles from './AuditForm.module.css';

export function AuditModal({ isOpen, onClose, pagePath, initialValues, durationMinutes = 30 }: {
  isOpen: boolean;
  onClose: () => void;
  pagePath: string;
  initialValues?: Partial<AuditFormValues>;
  durationMinutes?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    setScrollLocked(true);
    return () => {
      dialog?.close();
      setScrollLocked(false);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className={styles.modalHeader}>
        <div>
          <h2 id={titleId}>Book your free {durationMinutes}-minute audit</h2>
          <p>Tell us about your business and choose your preferred appointment time.</p>
        </div>
        <button type="button" onClick={onClose} className={styles.close} aria-label="Close audit form">
          <X aria-hidden="true" />
        </button>
      </div>
      <AuditForm pagePath={pagePath} initialValues={initialValues} durationMinutes={durationMinutes} autoFocus />
    </dialog>,
    document.body,
  );
}

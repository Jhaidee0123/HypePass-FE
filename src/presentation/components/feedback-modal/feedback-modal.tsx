/**
 * FeedbackModal — aligned to the Pulse design system (ink canvas + lime/magenta
 * accents, Bebas Neue title, mono eyebrow). Supports auto-close with progress
 * bar, manual close, and an optional retry action.
 *
 * Usage:
 *   <FeedbackModal
 *     open={showModal}
 *     onClose={() => setShowModal(false)}
 *     variant="success"
 *     title="Done!"
 *     body="Operation completed successfully."
 *     autoCloseMs={2000}
 *   />
 */
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Styles from './feedback-modal-styles.scss';

type Variant = 'success' | 'error';

type Props = {
  open: boolean;
  onClose: () => void;
  variant: Variant;
  title: string;
  body: string;
  /** Auto-close after this many ms. Hides buttons, shows a progress bar. */
  autoCloseMs?: number;
  /** Label for the primary button. Defaults to "Close". */
  buttonText?: string;
  /** Show a secondary "Try again" button (error variant only). */
  showRetry?: boolean;
  /** Label for the retry button. Defaults to "Try again". */
  retryText?: string;
  onRetry?: () => void;
  onConfirm?: () => void;
  /** Eyebrow text over the title. Defaults to "HECHO" / "ERROR". */
  eyebrow?: string;
};

const FeedbackModal: React.FC<Props> = ({
  open,
  onClose,
  variant,
  title,
  body,
  autoCloseMs,
  buttonText = 'Close',
  showRetry = false,
  retryText = 'Try again',
  onRetry,
  onConfirm,
  eyebrow,
}: Props) => {
  const [progress, setProgress] = useState(0);

  const handleClose = useCallback((): void => {
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  const handleRetry = useCallback((): void => {
    onRetry?.();
    onClose();
  }, [onRetry, onClose]);

  useEffect(() => {
    if (!open || !autoCloseMs) {
      setProgress(0);
      return;
    }
    const interval = 20;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / autoCloseMs) * 100, 100));
      if (elapsed >= autoCloseMs) {
        clearInterval(timer);
        handleClose();
      }
    }, interval);
    return () => clearInterval(timer);
  }, [open, autoCloseMs, handleClose]);

  if (!open) return null;

  const isAutoClose = !!autoCloseMs;
  const isSuccess = variant === 'success';
  const eyebrowLabel = eyebrow ?? (isSuccess ? 'HECHO' : 'ERROR');
  const eyebrowClass = isSuccess ? Styles.eyebrowSuccess : Styles.eyebrowError;
  const accentClass = isSuccess ? Styles.accentSuccess : Styles.accentError;

  return createPortal(
    <div className={Styles.overlay} onClick={isAutoClose ? undefined : onClose}>
      <div
        className={Styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${Styles.accent} ${accentClass}`} />

        <div className={Styles.content}>
          <div className={`${Styles.eyebrow} ${eyebrowClass}`}>
            <span className={Styles.iconGlyph}>{isSuccess ? '✓' : '×'}</span>
            {eyebrowLabel}
          </div>
          <h3 className={Styles.title}>{title}</h3>
          <p className={Styles.body}>{body}</p>
        </div>

        {isAutoClose ? (
          <div className={Styles.progressTrack}>
            <div
              className={`${Styles.progressBar} ${isSuccess ? Styles.progressSuccess : Styles.progressError}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <div className={Styles.actions}>
            {variant === 'error' && showRetry && (
              <button
                type="button"
                className={`${Styles.button} ${Styles.outlineButton}`}
                onClick={handleRetry}
              >
                {retryText}
              </button>
            )}
            <button
              type="button"
              className={`${Styles.button} ${Styles.primaryButton}`}
              onClick={handleClose}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default FeedbackModal;

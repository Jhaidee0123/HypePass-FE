/**
 * FeedbackModal Component
 *
 * A portal-based modal for showing success/error feedback.
 * Supports auto-close with progress bar, manual close, and retry actions.
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
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Styles from './feedback-modal-styles.scss';

type Variant = 'success' | 'error';

type Props = {
  open: boolean;
  onClose: () => void;
  variant: Variant;
  title: string;
  body: string;
  /** Auto-close after this many milliseconds. When set, the close button is hidden and a progress bar is shown. */
  autoCloseMs?: number;
  /** Label for the primary button. Defaults to "Close". Hidden when autoCloseMs is set. */
  buttonText?: string;
  /** Show a secondary "Try Again" button (error variant only). */
  showRetry?: boolean;
  /** Label for the retry button. Defaults to "Try Again". */
  retryText?: string;
  /** Callback when the retry button is clicked. */
  onRetry?: () => void;
  /** Callback when the primary button is clicked (or auto-close fires). */
  onConfirm?: () => void;
};

const SuccessIcon: React.FC = () => (
  <div className={`${Styles.iconCircle} ${Styles.successCircle}`}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  </div>
);

const ErrorIcon: React.FC = () => (
  <div className={`${Styles.iconCircle} ${Styles.errorCircle}`}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  </div>
);

const FeedbackModal: React.FC<Props> = ({
  open,
  onClose,
  variant,
  title,
  body,
  autoCloseMs,
  buttonText = 'Close',
  showRetry = false,
  retryText = 'Try Again',
  onRetry,
  onConfirm
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

  // Auto-close timer with progress
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

  return createPortal(
    <div className={Styles.overlay}>
      <div className={Styles.modal} role="dialog" aria-modal="true">
        <div className={Styles.content}>
          {variant === 'success' ? <SuccessIcon /> : <ErrorIcon />}
          <h3 className={Styles.title}>{title}</h3>
          <p className={Styles.body}>{body}</p>
        </div>

        {isAutoClose && (
          <div className={Styles.progressTrack}>
            <div
              className={`${Styles.progressBar} ${variant === 'success' ? Styles.progressSuccess : Styles.progressError}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {!isAutoClose && (
          <div className={Styles.actions}>
            {variant === 'error' && showRetry && (
              <button type="button" className={Styles.outlineButton} onClick={handleRetry}>
                {retryText}
              </button>
            )}
            <button type="button" className={Styles.primaryButton} onClick={handleClose}>
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default FeedbackModal;

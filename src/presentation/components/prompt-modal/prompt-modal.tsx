import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from '../confirm-modal/confirm-modal-styles.scss';
import PulseButton from '../pulse-button/pulse-button';

type Variant = 'default' | 'danger';

type Props = {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  eyebrow?: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  busy?: boolean;
  initialValue?: string;
  error?: string | null;
  onConfirm: (value: string) => void | Promise<void>;
  onCancel: () => void;
};

const PromptModal: React.FC<Props> = ({
  open,
  title,
  body,
  eyebrow,
  label,
  placeholder,
  multiline = false,
  required = false,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  busy = false,
  initialValue = '',
  error,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  if (!open) return null;

  const canConfirm = !busy && (!required || value.trim().length > 0);

  return (
    <div className={Styles.backdrop} onClick={busy ? undefined : onCancel}>
      <div
        className={`${Styles.modal} ${variant === 'danger' ? Styles.danger : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {eyebrow && <div className={Styles.eyebrow}>◆ {eyebrow}</div>}
        <h2 className={Styles.title}>{title}</h2>
        {body && <div className={Styles.body}>{body}</div>}

        <label className={Styles.label}>{label}</label>
        {multiline ? (
          <textarea
            className={Styles.textarea}
            rows={3}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            disabled={busy}
          />
        ) : (
          <input
            className={Styles.input}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            disabled={busy}
          />
        )}

        {error && <div className={Styles.error}>{error}</div>}

        <div className={Styles.actions}>
          <PulseButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel ?? t('common.cancel')}
          </PulseButton>
          <PulseButton
            type="button"
            variant="primary"
            onClick={() => void onConfirm(value.trim())}
            disabled={!canConfirm}
          >
            {busy
              ? t('common.loading')
              : (confirmLabel ?? t('common.confirm'))}
          </PulseButton>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;

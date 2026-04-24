import React from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './confirm-modal-styles.scss';
import PulseButton from '../pulse-button/pulse-button';

type Variant = 'default' | 'danger';

type Props = {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  eyebrow?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

const ConfirmModal: React.FC<Props> = ({
  open,
  title,
  body,
  eyebrow,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  busy = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className={Styles.backdrop} onClick={busy ? undefined : onCancel}>
      <div
        className={`${Styles.modal} ${variant === 'danger' ? Styles.danger : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {eyebrow && <div className={Styles.eyebrow}>◆ {eyebrow}</div>}
        <h2 className={Styles.title}>{title}</h2>
        {body && <div className={Styles.body}>{body}</div>}

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
            onClick={() => void onConfirm()}
            disabled={busy}
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

export default ConfirmModal;

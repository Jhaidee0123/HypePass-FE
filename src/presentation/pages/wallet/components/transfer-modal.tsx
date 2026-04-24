import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './transfer-modal-styles.scss';
import { PulseButton } from '@/presentation/components';
import { Transfer } from '@/domain/usecases';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticketId: string;
  eventTitle: string;
  transfer: Transfer;
};

export const TransferModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  ticketId,
  eventTitle,
  transfer,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!open) return null;

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const canSubmit = emailValid && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await transfer.transfer({
        ticketId,
        recipientEmail: email.trim(),
        note: note.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
      setConfirmed(false);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setEmail('');
    setNote('');
    setConfirmed(false);
    setError(null);
    onClose();
  };

  return (
    <div className={Styles.backdrop} onClick={close}>
      <div className={Styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={Styles.eyebrow}>◆ {t('transfer.eyebrow')}</div>
        <h2 className={Styles.title}>
          {confirmed
            ? t('transfer.confirmTitle')
            : t('transfer.title')}
        </h2>
        <p className={Styles.subtitle}>
          {t('transfer.subtitle', { eventTitle })}
        </p>

        <form onSubmit={handleSubmit}>
          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('transfer.fields.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setConfirmed(false);
              }}
              placeholder="destinatario@email.com"
              className={Styles.input}
              disabled={busy}
              required
            />
          </div>

          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('transfer.fields.note')}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('transfer.fields.notePlaceholder')}
              className={Styles.textarea}
              rows={3}
              disabled={busy}
            />
          </div>

          {confirmed && !error && (
            <div className={Styles.warning}>
              <strong>{t('transfer.warning.title')}</strong>{' '}
              {t('transfer.warning.body')}
            </div>
          )}

          {error && <div className={Styles.error}>{error}</div>}

          <div className={Styles.actions}>
            <PulseButton
              type="button"
              variant="secondary"
              onClick={close}
              disabled={busy}
            >
              {t('common.cancel')}
            </PulseButton>
            <PulseButton
              type="submit"
              variant="primary"
              disabled={!canSubmit}
            >
              {busy
                ? t('common.loading')
                : confirmed
                  ? t('transfer.confirmCta')
                  : t('transfer.continueCta')}
            </PulseButton>
          </div>
        </form>
      </div>
    </div>
  );
};

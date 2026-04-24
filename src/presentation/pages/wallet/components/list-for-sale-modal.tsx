import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './transfer-modal-styles.scss';
import { PulseButton } from '@/presentation/components';
import { Marketplace, PayoutMethods } from '@/domain/usecases';
import { PayoutMethod } from '@/domain/models';

const PRICE_CAP_MULTIPLIER = 1.2;
const PLATFORM_FEE_PCT = 10;

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticketId: string;
  eventTitle: string;
  currency: string;
  faceValue: number;
  marketplace: Marketplace;
  payoutMethods: PayoutMethods;
};

export const ListForSaleModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  ticketId,
  eventTitle,
  currency,
  faceValue,
  marketplace,
  payoutMethods,
}) => {
  const { t } = useTranslation();
  const [askPriceStr, setAskPriceStr] = useState<string>(
    String(Math.round(faceValue / 100)),
  );
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultMethod, setDefaultMethod] = useState<PayoutMethod | null>(
    null,
  );
  const [loadingMethods, setLoadingMethods] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingMethods(true);
    payoutMethods
      .list()
      .then((list) => setDefaultMethod(list.find((m) => m.isDefault) ?? null))
      .catch(() => setDefaultMethod(null))
      .finally(() => setLoadingMethods(false));
  }, [open, payoutMethods]);

  const priceCapMinor = useMemo(
    () => Math.round(faceValue * PRICE_CAP_MULTIPLIER),
    [faceValue],
  );
  const askMinor = useMemo(() => {
    const n = Number(askPriceStr);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }, [askPriceStr]);

  const feeMinor = Math.round((askMinor * PLATFORM_FEE_PCT) / 100);
  const netMinor = askMinor - feeMinor;

  if (!open) return null;

  const fmt = (minor: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);

  const inRange = askMinor > 0 && askMinor <= priceCapMinor;
  const canSubmit = inRange && !busy && !!defaultMethod && !loadingMethods;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await marketplace.createListing({
        ticketId,
        askPrice: askMinor,
        note: note.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setAskPriceStr(String(Math.round(faceValue / 100)));
    setNote('');
    setError(null);
    onClose();
  };

  return (
    <div className={Styles.backdrop} onClick={close}>
      <div className={Styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={Styles.eyebrow}>◆ {t('marketplace.modal.eyebrow')}</div>
        <h2 className={Styles.title}>{t('marketplace.modal.title')}</h2>
        <p className={Styles.subtitle}>
          {t('marketplace.modal.subtitle', { eventTitle })}
        </p>

        {!loadingMethods && !defaultMethod && (
          <div
            className={Styles.warning}
            style={{
              borderColor: 'rgba(255,77,90,0.55)',
              background: 'rgba(255,77,90,0.08)',
            }}
          >
            <strong style={{ color: '#ff4d5a' }}>
              {t('marketplace.modal.noPayoutTitle')}
            </strong>
            {t('marketplace.modal.noPayoutBody')}
            <div style={{ marginTop: 10 }}>
              <Link
                to="/profile"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  color: '#d7ff3a',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
                onClick={close}
              >
                {t('marketplace.modal.goToProfile')} →
              </Link>
            </div>
          </div>
        )}
        {defaultMethod && (
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: '#6b6760',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {t('marketplace.modal.payoutTo', {
              method: t(
                `profile.payoutMethods.types.${defaultMethod.type}`,
              ),
              account: defaultMethod.accountNumber.slice(-4),
            })}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('marketplace.modal.fields.askPrice', { currency })}
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={askPriceStr}
              onChange={(e) => setAskPriceStr(e.target.value)}
              className={Styles.input}
              disabled={busy}
              required
            />
            <div
              style={{
                fontSize: 11,
                marginTop: 6,
                color: inRange ? '#bfbab1' : '#ff4d5a',
              }}
            >
              {t('marketplace.modal.priceHint', {
                face: fmt(faceValue),
                cap: fmt(priceCapMinor),
              })}
            </div>
          </div>

          <div className={Styles.field}>
            <label className={Styles.label}>
              {t('marketplace.modal.fields.note')}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={Styles.textarea}
              rows={2}
              maxLength={500}
              disabled={busy}
            />
          </div>

          {inRange && (
            <div className={Styles.warning} style={{ borderColor: '#d7ff3a55', background: 'rgba(215,255,58,.08)' }}>
              <strong style={{ color: '#d7ff3a' }}>
                {t('marketplace.modal.breakdown.title')}
              </strong>
              <div>
                {t('marketplace.modal.breakdown.gross')}: {fmt(askMinor)}
              </div>
              <div>
                {t('marketplace.modal.breakdown.fee', { pct: PLATFORM_FEE_PCT })}: −{fmt(feeMinor)}
              </div>
              <div style={{ marginTop: 4, fontWeight: 700 }}>
                {t('marketplace.modal.breakdown.net')}: {fmt(netMinor)}
              </div>
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
            <PulseButton type="submit" variant="primary" disabled={!canSubmit}>
              {busy ? t('common.loading') : t('marketplace.modal.submit')}
            </PulseButton>
          </div>
        </form>
      </div>
    </div>
  );
};

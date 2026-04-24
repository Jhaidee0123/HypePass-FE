import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from '../profile-styles.scss';
import {
  ConfirmModal,
  PulseButton,
} from '@/presentation/components';
import { PayoutMethods } from '@/domain/usecases';
import {
  PayoutMethod,
  PAYOUT_METHOD_TYPES,
  PayoutMethodType,
} from '@/domain/models';

type Props = {
  payoutMethods: PayoutMethods;
};

type FormState = {
  type: PayoutMethodType;
  bankName: string;
  accountNumber: string;
  holderName: string;
  holderLegalIdType: string;
  holderLegalId: string;
  makeDefault: boolean;
};

const emptyForm: FormState = {
  type: 'nequi',
  bankName: '',
  accountNumber: '',
  holderName: '',
  holderLegalIdType: 'CC',
  holderLegalId: '',
  makeDefault: true,
};

const maskAccount = (value: string): string => {
  if (!value) return '';
  if (value.length <= 4) return value;
  return `••••${value.slice(-4)}`;
};

export const PayoutMethodsSection: React.FC<Props> = ({ payoutMethods }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<PayoutMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PayoutMethod | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await payoutMethods.list());
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  }, [payoutMethods, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const requiresBankName = form.type === 'other_bank';
  const canSubmit =
    !submitting &&
    form.accountNumber.trim().length >= 5 &&
    form.holderName.trim().length >= 2 &&
    form.holderLegalId.trim().length >= 3 &&
    (!requiresBankName || form.bankName.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await payoutMethods.create({
        type: form.type,
        bankName: form.bankName.trim() || undefined,
        accountNumber: form.accountNumber.trim(),
        holderName: form.holderName.trim(),
        holderLegalIdType: form.holderLegalIdType.toUpperCase(),
        holderLegalId: form.holderLegalId.trim(),
        makeDefault: form.makeDefault,
      });
      setForm(emptyForm);
      setCreating(false);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeDefault = async (m: PayoutMethod) => {
    setBusyId(m.id);
    try {
      await payoutMethods.makeDefault(m.id);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await payoutMethods.delete(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className={Styles.card}>
      <div className={Styles.cardTitle}>
        ◆ {t('profile.payoutMethods.title')}
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      {items === null ? (
        <div className={Styles.fieldHint}>{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className={Styles.fieldHint}>
          {t('profile.payoutMethods.empty')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: '#0a0908',
                border: '1px solid #242320',
                borderRadius: 6,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: m.isDefault ? '#d7ff3a' : '#908b83',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {t(`profile.payoutMethods.types.${m.type}`)}
                  {m.bankName ? ` · ${m.bankName}` : ''}
                  {m.isDefault ? (
                    <>
                      {' · '}
                      <strong>
                        {t('profile.payoutMethods.defaultBadge')}
                      </strong>
                    </>
                  ) : (
                    ''
                  )}
                </div>
                <div style={{ color: '#faf7f0', fontSize: 14 }}>
                  {maskAccount(m.accountNumber)} · {m.holderName}
                </div>
                <div style={{ color: '#6b6760', fontSize: 12, marginTop: 2 }}>
                  {m.holderLegalIdType} {m.holderLegalId}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {!m.isDefault && (
                  <PulseButton
                    type="button"
                    variant="secondary"
                    onClick={() => void handleMakeDefault(m)}
                    disabled={busyId === m.id}
                  >
                    {t('profile.payoutMethods.makeDefault')}
                  </PulseButton>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(m)}
                  disabled={busyId === m.id}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ff4d5a',
                    color: '#ff4d5a',
                    padding: '8px 12px',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {t('profile.payoutMethods.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        {creating ? (
          <form onSubmit={handleSubmit} className={Styles.form}>
            <div className={Styles.field}>
              <label className={Styles.label}>
                {t('profile.payoutMethods.fields.type')}
              </label>
              <select
                className={Styles.input}
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as PayoutMethodType,
                  }))
                }
              >
                {PAYOUT_METHOD_TYPES.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`profile.payoutMethods.types.${opt}`)}
                  </option>
                ))}
              </select>
            </div>
            {requiresBankName && (
              <div className={Styles.field}>
                <label className={Styles.label}>
                  {t('profile.payoutMethods.fields.bankName')}
                </label>
                <input
                  className={Styles.input}
                  value={form.bankName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bankName: e.target.value }))
                  }
                  required
                />
              </div>
            )}
            <div className={Styles.field}>
              <label className={Styles.label}>
                {t('profile.payoutMethods.fields.accountNumber')}
              </label>
              <input
                className={Styles.input}
                value={form.accountNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    accountNumber: e.target.value.replace(/\s+/g, ''),
                  }))
                }
                required
              />
            </div>
            <div className={Styles.field}>
              <label className={Styles.label}>
                {t('profile.payoutMethods.fields.holderName')}
              </label>
              <input
                className={Styles.input}
                value={form.holderName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, holderName: e.target.value }))
                }
                required
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr',
                gap: 10,
              }}
            >
              <div className={Styles.field}>
                <label className={Styles.label}>
                  {t('profile.payoutMethods.fields.holderLegalIdType')}
                </label>
                <select
                  className={Styles.input}
                  value={form.holderLegalIdType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      holderLegalIdType: e.target.value,
                    }))
                  }
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="PP">PP</option>
                  <option value="NIT">NIT</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              <div className={Styles.field}>
                <label className={Styles.label}>
                  {t('profile.payoutMethods.fields.holderLegalId')}
                </label>
                <input
                  className={Styles.input}
                  value={form.holderLegalId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      holderLegalId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 12,
                color: '#bfbab1',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.makeDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, makeDefault: e.target.checked }))
                }
              />
              {t('profile.payoutMethods.fields.makeDefault')}
            </label>
            <div className={Styles.actions}>
              <PulseButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setCreating(false);
                  setForm(emptyForm);
                }}
                disabled={submitting}
              >
                {t('common.cancel')}
              </PulseButton>
              <PulseButton
                type="submit"
                variant="primary"
                disabled={!canSubmit}
              >
                {submitting
                  ? t('common.loading')
                  : t('profile.payoutMethods.submit')}
              </PulseButton>
            </div>
          </form>
        ) : (
          <PulseButton
            type="button"
            variant="secondary"
            onClick={() => setCreating(true)}
          >
            + {t('profile.payoutMethods.addNew')}
          </PulseButton>
        )}
      </div>

      <p className={Styles.fieldHint} style={{ marginTop: 12 }}>
        {t('profile.payoutMethods.note')}
      </p>

      <ConfirmModal
        open={deleteTarget !== null}
        eyebrow={t('profile.payoutMethods.title')}
        title={t('profile.payoutMethods.deleteConfirmTitle')}
        body={t('profile.payoutMethods.deleteConfirmBody')}
        variant="danger"
        busy={busyId === deleteTarget?.id}
        confirmLabel={t('profile.payoutMethods.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

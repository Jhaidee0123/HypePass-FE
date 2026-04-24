import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './admin-styles.scss';
import { ConfirmModal, PulseButton } from '@/presentation/components';
import { AdminPayouts } from '@/domain/usecases';
import { PayoutRecord, PayoutStatus } from '@/domain/models';

type Props = {
  payouts: AdminPayouts;
};

const STATUSES: PayoutStatus[] = [
  'payable',
  'pending_event',
  'pending',
  'paid',
  'failed',
  'cancelled',
];

const fmt = (minor: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);

const AdminPayoutsPage: React.FC<Props> = ({ payouts }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<PayoutStatus>('payable');
  const [items, setItems] = useState<PayoutRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] =
    useState<null | { action: 'paid' | 'failed' | 'cancelled'; id: string }>(
      null,
    );

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await payouts.list({ status });
      setItems(list);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  }, [payouts, status, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const apply = async () => {
    if (!confirm) return;
    setBusyId(confirm.id);
    try {
      if (confirm.action === 'paid') await payouts.markPaid(confirm.id);
      if (confirm.action === 'failed') await payouts.markFailed(confirm.id);
      if (confirm.action === 'cancelled') await payouts.cancel(confirm.id);
      setConfirm(null);
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

  const summary = useMemo(() => {
    if (!items) return null;
    const total = items.reduce((acc, p) => acc + p.netAmount, 0);
    const currency = items[0]?.currency ?? 'COP';
    return { count: items.length, total, currency };
  }, [items]);

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('admin.payouts.title')}</title>
      </Helmet>

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ ADMIN</div>
        <h1 className={Styles.title}>{t('admin.payouts.title')}</h1>
        <p style={{ color: '#908b83', marginTop: 8, fontSize: 14 }}>
          <Link
            to="/admin"
            style={{
              color: '#bfbab1',
              textDecoration: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            ← {t('common.back')}
          </Link>
        </p>
      </header>

      <div className={Styles.tabs}>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`${Styles.tab} ${status === s ? Styles.tabActive : ''}`}
            onClick={() => setStatus(s)}
          >
            {t(`admin.payouts.status.${s}`)}
          </button>
        ))}
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      {summary && (
        <div
          style={{
            marginBottom: 18,
            padding: '12px 16px',
            background: '#121110',
            border: '1px solid #242320',
            borderRadius: 6,
            fontSize: 13,
            color: '#bfbab1',
          }}
        >
          <strong style={{ color: '#faf7f0' }}>{summary.count}</strong>{' '}
          {t('admin.payouts.summaryCount')} ·{' '}
          <strong style={{ color: '#d7ff3a' }}>
            {fmt(summary.total, summary.currency)}
          </strong>{' '}
          {t('admin.payouts.summaryTotal')}
        </div>
      )}

      {items === null ? (
        <div className={Styles.loading}>{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className={Styles.empty}>{t('admin.payouts.empty')}</div>
      ) : (
        <div className={Styles.list}>
          {items.map((p) => (
            <div key={p.id} className={Styles.row}>
              <div className={Styles.rowLeft}>
                <div className={Styles.thumbEmpty}>
                  {p.transactionType === 'reseller_payout' ? 'R' : 'O'}
                </div>
                <div>
                  <div className={Styles.itemTitle}>
                    {fmt(p.netAmount, p.currency)}{' '}
                    <span style={{ color: '#6b6760', fontSize: 12 }}>
                      ({t('admin.payouts.gross')} {fmt(p.grossAmount, p.currency)}{' '}
                      · {t('admin.payouts.fee')}{' '}
                      {fmt(p.platformFee, p.currency)})
                    </span>
                  </div>
                  <div className={Styles.itemMeta}>
                    {p.transactionType === 'reseller_payout'
                      ? t('admin.payouts.types.reseller')
                      : p.transactionType === 'organizer_sale_settlement'
                        ? t('admin.payouts.types.organizer')
                        : t('admin.payouts.types.refund')}{' '}
                    ·{' '}
                    {p.sellerUserId
                      ? `seller ${p.sellerUserId.slice(0, 8)}`
                      : p.companyId
                        ? `company ${p.companyId.slice(0, 8)}`
                        : '—'}{' '}
                    · {new Date(p.createdAt).toLocaleString()}
                  </div>
                  {p.status === 'pending_event' && p.releaseAt && (
                    <div
                      className={Styles.itemMeta}
                      style={{ color: '#ffb454' }}
                    >
                      {t('admin.payouts.releaseAt', {
                        date: new Date(p.releaseAt).toLocaleString(),
                      })}
                    </div>
                  )}
                  {(p.payoutAccountNumber || p.payoutAccountType) && (
                    <div
                      className={Styles.itemMeta}
                      style={{ color: '#d7ff3a' }}
                    >
                      {p.payoutAccountType
                        ? t(`profile.payoutMethods.types.${p.payoutAccountType}`)
                        : ''}
                      {p.payoutAccountBankName
                        ? ` · ${p.payoutAccountBankName}`
                        : ''}
                      {p.payoutAccountNumber
                        ? ` · ${p.payoutAccountNumber}`
                        : ''}
                      {p.payoutAccountHolderName
                        ? ` · ${p.payoutAccountHolderName}`
                        : ''}
                      {p.payoutAccountHolderLegalId
                        ? ` (${p.payoutAccountHolderLegalIdType} ${p.payoutAccountHolderLegalId})`
                        : ''}
                    </div>
                  )}
                  {!p.payoutAccountNumber && (
                    <div
                      className={Styles.itemMeta}
                      style={{ color: '#ff4d5a' }}
                    >
                      {t('admin.payouts.noPayoutAccount')}
                    </div>
                  )}
                </div>
              </div>
              {p.status === 'payable' && (
                <div className={Styles.actions}>
                  <PulseButton
                    variant="secondary"
                    onClick={() => setConfirm({ action: 'cancelled', id: p.id })}
                    disabled={busyId === p.id}
                  >
                    {t('admin.payouts.cancel')}
                  </PulseButton>
                  <PulseButton
                    variant="secondary"
                    onClick={() => setConfirm({ action: 'failed', id: p.id })}
                    disabled={busyId === p.id}
                  >
                    {t('admin.payouts.markFailed')}
                  </PulseButton>
                  <PulseButton
                    variant="primary"
                    onClick={() => setConfirm({ action: 'paid', id: p.id })}
                    disabled={busyId === p.id}
                  >
                    {t('admin.payouts.markPaid')}
                  </PulseButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirm !== null}
        eyebrow={t('admin.payouts.title')}
        title={
          confirm?.action === 'paid'
            ? t('admin.payouts.confirm.paidTitle')
            : confirm?.action === 'failed'
              ? t('admin.payouts.confirm.failedTitle')
              : t('admin.payouts.confirm.cancelTitle')
        }
        body={
          confirm?.action === 'paid'
            ? t('admin.payouts.confirm.paidBody')
            : confirm?.action === 'failed'
              ? t('admin.payouts.confirm.failedBody')
              : t('admin.payouts.confirm.cancelBody')
        }
        variant={confirm?.action === 'paid' ? 'default' : 'danger'}
        busy={busyId !== null}
        onConfirm={apply}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AdminPayoutsPage;

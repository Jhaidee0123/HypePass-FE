import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { SeoHelmet } from '@/presentation/components';
import { MyPayouts } from '@/domain/usecases';
import { PayoutRecord, PayoutStatus } from '@/domain/models';

type Props = {
  payouts: MyPayouts;
};

const STATUS_COLORS: Record<PayoutStatus, { fg: string; bg: string }> = {
  pending: { fg: '#bfbab1', bg: 'rgba(191,186,177,0.08)' },
  pending_event: { fg: '#ffb454', bg: 'rgba(255,180,84,0.10)' },
  payable: { fg: '#d7ff3a', bg: 'rgba(215,255,58,0.08)' },
  paid: { fg: '#5eeac7', bg: 'rgba(94,234,199,0.10)' },
  failed: { fg: '#ff4d5a', bg: 'rgba(255,77,90,0.10)' },
  cancelled: { fg: '#6b6760', bg: 'rgba(107,103,96,0.08)' },
};

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);

const MyPayoutsPage: React.FC<Props> = ({ payouts }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<PayoutRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    payouts
      .list()
      .then(setItems)
      .catch((err: any) =>
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        ),
      );
  }, [payouts, t]);

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${t('organizer.myPayouts.title')}`}
        description={t('organizer.myPayouts.subtitle')}
      />

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ ORGANIZER</div>
        <h1 className={Styles.title}>{t('organizer.myPayouts.title')}</h1>
        <p style={{ color: '#908b83', marginTop: 8, fontSize: 14 }}>
          {t('organizer.myPayouts.subtitle')}
        </p>
        <div style={{ marginTop: 12 }}>
          <Link
            to="/organizer"
            style={{
              color: '#bfbab1',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            ← {t('common.back')}
          </Link>
        </div>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      {items === null ? (
        <div className={Styles.card}>{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className={Styles.card}>{t('organizer.myPayouts.empty')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((p) => {
            const color =
              STATUS_COLORS[p.status] ?? STATUS_COLORS.pending;
            return (
              <div key={p.id} className={Styles.card}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        letterSpacing: '0.12em',
                        color: '#908b83',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t(
                        `organizer.myPayouts.txTypes.${p.transactionType}`,
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Bebas Neue, Impact, sans-serif',
                        fontSize: 28,
                        color: '#faf7f0',
                        marginTop: 4,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {formatMoney(p.netAmount, p.currency)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6b6760',
                        marginTop: 2,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {t('organizer.myPayouts.gross')}{' '}
                      {formatMoney(p.grossAmount, p.currency)} ·{' '}
                      {t('organizer.myPayouts.fee')}{' '}
                      {formatMoney(p.platformFee, p.currency)}
                    </div>
                    {p.payoutAccountNumber && (
                      <div
                        style={{
                          fontSize: 11,
                          color: '#908b83',
                          marginTop: 6,
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        →{' '}
                        {p.payoutAccountBankName ?? '—'} ····
                        {p.payoutAccountNumber.slice(-4)}{' '}
                        {p.payoutAccountHolderName
                          ? `· ${p.payoutAccountHolderName}`
                          : ''}
                      </div>
                    )}
                    {p.failureReason && (
                      <div
                        style={{
                          fontSize: 11,
                          color: '#ff4d5a',
                          marginTop: 6,
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        ⚠ {p.failureReason}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 10px',
                        background: color.bg,
                        color: color.fg,
                        border: `1px solid ${color.fg}33`,
                        borderRadius: 3,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t(`organizer.myPayouts.status.${p.status}`)}
                    </span>
                    {p.settledAt && (
                      <span
                        style={{
                          fontSize: 10,
                          color: '#6b6760',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {new Date(p.settledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPayoutsPage;

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Styles from './promoter-styles.scss';
import { MyPromotedEventRow, PromoterSelf } from '@/domain/usecases';

type Props = {
  promoter: PromoterSelf;
};

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);

const PromoterHome: React.FC<Props> = ({ promoter }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<MyPromotedEventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await promoter.listEvents();
        setEvents(list);
        // Refresh the cached promoter status used by the Nav so the
        // "Promotor" link starts (or stops) showing right away.
        try {
          sessionStorage.removeItem('hypepass.isPromoter');
        } catch {
          /* ignore */
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
        );
      }
    };
    void load();
  }, [promoter, t]);

  const copy = async (row: MyPromotedEventRow) => {
    try {
      await navigator.clipboard.writeText(row.referralLink);
      setCopiedId(row.eventId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('promoter.home.title')}</title>
      </Helmet>
      <div className={Styles.eyebrow}>◆ PROMOTOR</div>
      <h1 className={Styles.title}>{t('promoter.home.title')}</h1>
      <p className={Styles.intro}>{t('promoter.home.intro')}</p>

      {error && <div className={Styles.error}>{error}</div>}
      {!events && !error && (
        <div className={Styles.loading}>{t('common.loading')}</div>
      )}
      {events && events.length === 0 && (
        <div className={Styles.empty}>{t('promoter.home.empty')}</div>
      )}

      {events && events.length > 0 && (
        <div className={Styles.grid}>
          {events.map((ev) => (
            <article
              key={`${ev.eventId}-${ev.referralCode}`}
              className={`${Styles.card} ${ev.revokedAt ? Styles.cardRevoked : ''}`}
            >
              {ev.coverImageUrl && (
                <div
                  className={Styles.cover}
                  style={{ backgroundImage: `url(${ev.coverImageUrl})` }}
                />
              )}
              <div className={Styles.cardBody}>
                <div className={Styles.cardHead}>
                  <Link
                    to={`/promoter/events/${ev.eventId}`}
                    className={Styles.cardTitle}
                  >
                    {ev.title}
                  </Link>
                  {ev.revokedAt && (
                    <span className={Styles.revokedPill}>
                      {t('promoter.home.revoked')}
                    </span>
                  )}
                </div>
                <div className={Styles.codeBox}>
                  <div className={Styles.codeLabel}>
                    {t('promoter.home.code')}
                  </div>
                  <div className={Styles.code}>{ev.referralCode}</div>
                  <button
                    type="button"
                    className={Styles.copyBtn}
                    onClick={() => copy(ev)}
                  >
                    {copiedId === ev.eventId
                      ? t('promoter.home.copied')
                      : t('promoter.home.copyLink')}
                  </button>
                </div>
                <div className={Styles.stats}>
                  <Stat label={t('promoter.home.tickets')} value={String(ev.ticketsSold)} />
                  <Stat
                    label={t('promoter.home.revenue')}
                    value={formatMoney(ev.grossRevenue, ev.currency)}
                  />
                </div>
                <Link
                  to={`/promoter/events/${ev.eventId}`}
                  className={Styles.detailLink}
                >
                  {t('promoter.home.detail')} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className={Styles.stat}>
    <div className={Styles.statLabel}>{label}</div>
    <div className={Styles.statValue}>{value}</div>
  </div>
);

export default PromoterHome;

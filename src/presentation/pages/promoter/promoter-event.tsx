import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import Styles from './promoter-styles.scss';
import { PromoterSalesResult, PromoterSelf } from '@/domain/usecases';

type Props = {
  promoter: PromoterSelf;
};

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);

const PromoterEvent: React.FC<Props> = ({ promoter }) => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const [data, setData] = useState<PromoterSalesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      try {
        const res = await promoter.getSales(eventId);
        setData(res);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
        );
      }
    };
    void load();
  }, [promoter, eventId, t]);

  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  if (error) return <div className={Styles.error}>{error}</div>;
  if (!data) return <div className={Styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {data.event.title}</title>
      </Helmet>
      <Link to="/promoter" className={Styles.back}>
        ← {t('promoter.event.back')}
      </Link>
      <div className={Styles.eyebrow}>◆ PROMOTOR</div>
      <h1 className={Styles.title}>{data.event.title}</h1>

      {data.revokedAt && (
        <div className={Styles.banner}>
          {t('promoter.event.revokedBanner', {
            date: new Date(data.revokedAt).toLocaleDateString(),
          })}
        </div>
      )}

      <div className={Styles.headerStats}>
        <BigStat
          label={t('promoter.event.ticketsSold')}
          value={String(data.summary.ticketsSold)}
        />
        <BigStat
          label={t('promoter.event.orders')}
          value={String(data.summary.ordersCount)}
        />
        <BigStat
          label={t('promoter.event.revenue')}
          value={formatMoney(data.summary.grossRevenue, data.summary.currency)}
        />
      </div>

      <div className={Styles.shareBox}>
        <div className={Styles.codeLabel}>{t('promoter.event.shareLabel')}</div>
        <div className={Styles.code}>{data.referralCode}</div>
        <div className={Styles.shareLink}>{data.referralLink}</div>
        <button type="button" className={Styles.shareBtn} onClick={copy}>
          {copied ? t('promoter.home.copied') : t('promoter.event.copyLink')}
        </button>
      </div>

      <h2 className={Styles.subTitle}>{t('promoter.event.ordersTitle')}</h2>
      {data.orders.length === 0 ? (
        <div className={Styles.empty}>{t('promoter.event.noOrders')}</div>
      ) : (
        <table className={Styles.ordersTable}>
          <thead>
            <tr>
              <th>{t('promoter.event.cols.date')}</th>
              <th>{t('promoter.event.cols.buyer')}</th>
              <th align="right">{t('promoter.event.cols.qty')}</th>
              <th align="right">{t('promoter.event.cols.total')}</th>
              <th>{t('promoter.event.cols.status')}</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.orderId}>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td className={Styles.mono}>{o.buyerEmailMasked}</td>
                <td align="right">{o.quantity}</td>
                <td align="right">{formatMoney(o.grossTotal, o.currency)}</td>
                <td>
                  <span
                    className={`${Styles.statusPill} ${Styles[`statusPill_${o.status}`] ?? ''}`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const BigStat: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className={Styles.bigStat}>
    <div className={Styles.statLabel}>{label}</div>
    <div className={Styles.bigStatValue}>{value}</div>
  </div>
);

export default PromoterEvent;

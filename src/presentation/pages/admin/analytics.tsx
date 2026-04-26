import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './analytics-styles.scss';
import { AdminAnalytics, AnalyticsResponse } from '@/domain/usecases';

type Props = {
  analytics: AdminAnalytics;
};

const RANGES = [7, 14, 30, 60, 90];

const AnalyticsPage: React.FC<Props> = ({ analytics }) => {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (next = days) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analytics.get(next);
      setData(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error && !data)
    return <div className={Styles.error}>{error}</div>;
  if (!data) return <div className={Styles.loading}>{t('common.loading')}</div>;

  const max = Math.max(1, ...data.series.map((d) => d.views));
  const W = 600;
  const H = 120;
  const stepX = data.series.length > 1 ? W / (data.series.length - 1) : W;
  const points = data.series
    .map((d, i) => {
      const x = i * stepX;
      const y = H - (d.views / max) * (H - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={Styles.wrap}>
      <div className={Styles.toolbar}>
        <div className={Styles.ranges}>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={`${Styles.rangeBtn} ${days === r ? Styles.rangeBtnActive : ''}`}
              onClick={() => {
                setDays(r);
                void load(r);
              }}
              disabled={loading}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {error && <div className={Styles.error}>{error}</div>}

      <div className={Styles.totals}>
        <Stat label={t('admin.analytics.totals.pageViews')} value={data.totals.pageViews} />
        <Stat
          label={t('admin.analytics.totals.uniqueSessions')}
          value={data.totals.uniqueSessions}
        />
        <Stat
          label={t('admin.analytics.totals.uniqueUsers')}
          value={data.totals.uniqueUsers}
        />
      </div>

      <div className={Styles.chartCard}>
        <div className={Styles.chartHead}>
          <span>{t('admin.analytics.viewsByDay')}</span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className={Styles.chart}
        >
          {data.series.length > 0 && (
            <>
              <path
                d={`M0,${H} L${points.split(' ').join(' L')} L${W},${H} Z`}
                fill="#d7ff3a"
                opacity="0.18"
              />
              <polyline
                points={points}
                fill="none"
                stroke="#d7ff3a"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
      </div>

      <div className={Styles.grid}>
        <div className={Styles.card}>
          <div className={Styles.cardTitle}>{t('admin.analytics.topPaths')}</div>
          {data.topPaths.length === 0 ? (
            <div className={Styles.empty}>—</div>
          ) : (
            <table className={Styles.table}>
              <thead>
                <tr>
                  <th>{t('admin.analytics.path')}</th>
                  <th align="right">{t('admin.analytics.views')}</th>
                  <th align="right">{t('admin.analytics.sessions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.topPaths.map((p) => (
                  <tr key={p.path}>
                    <td className={Styles.codeCell}>{p.path}</td>
                    <td align="right">{p.views.toLocaleString()}</td>
                    <td align="right">{p.sessions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={Styles.card}>
          <div className={Styles.cardTitle}>
            {t('admin.analytics.topReferrers')}
          </div>
          {data.topReferrers.length === 0 ? (
            <div className={Styles.empty}>—</div>
          ) : (
            <ul className={Styles.simple}>
              {data.topReferrers.map((r) => (
                <li key={r.referrer}>
                  <span className={Styles.codeCell}>{r.referrer}</span>
                  <span>{r.views.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={Styles.card}>
          <div className={Styles.cardTitle}>{t('admin.analytics.devices')}</div>
          {data.devices.length === 0 ? (
            <div className={Styles.empty}>—</div>
          ) : (
            <ul className={Styles.simple}>
              {data.devices.map((d) => (
                <li key={d.device}>
                  <span>{d.device}</span>
                  <span>{d.views.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className={Styles.stat}>
    <div className={Styles.statLabel}>{label}</div>
    <div className={Styles.statValue}>{value.toLocaleString()}</div>
  </div>
);

export default AnalyticsPage;

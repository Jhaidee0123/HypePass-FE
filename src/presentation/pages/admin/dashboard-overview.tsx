import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './dashboard-overview-styles.scss';
import { AdminDashboard, AdminDashboardResponse } from '@/domain/usecases';

type Props = {
  dashboard: AdminDashboard;
};

const formatMoney = (cents: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

const formatNum = (n: number) => new Intl.NumberFormat('es-CO').format(n);

const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const DashboardOverview: React.FC<Props> = ({ dashboard }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError(null);
    setRefreshing(true);
    try {
      const res = await dashboard.get();
      setData(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, [dashboard]);

  if (error) return <div className={Styles.error}>{error}</div>;
  if (!data) return <div className={Styles.loading}>{t('common.loading')}</div>;

  const { kpis, series, top, health } = data;

  return (
    <div className={Styles.cockpit}>
      <div className={Styles.headerRow}>
        <div className={Styles.healthBadges}>
          <HealthBadge
            label={t('admin.overview.health.db')}
            tone={health.db.status === 'ok' ? 'ok' : 'bad'}
            value={`${health.db.latencyMs}ms`}
          />
          <HealthBadge
            label={t('admin.overview.health.uptime')}
            tone="ok"
            value={formatUptime(health.uptimeSec)}
          />
          <HealthBadge
            label={t('admin.overview.health.reconcile')}
            tone={health.needsReconciliation === 0 ? 'ok' : 'warn'}
            value={String(health.needsReconciliation)}
          />
        </div>
        <button
          type="button"
          className={Styles.refresh}
          onClick={load}
          disabled={refreshing}
        >
          {refreshing ? t('common.loading') : t('admin.overview.refresh')}
        </button>
      </div>

      {/* KPI cards */}
      <div className={Styles.kpiGrid}>
        <KpiCard
          label={t('admin.overview.kpi.revenueTotal')}
          value={formatMoney(kpis.revenue.total)}
          sub={t('admin.overview.kpi.fees', {
            amount: formatMoney(kpis.revenue.platformFees),
          })}
          accent="lime"
        />
        <KpiCard
          label={t('admin.overview.kpi.revenue30d')}
          value={formatMoney(kpis.revenue.last30d)}
          sub={t('admin.overview.kpi.revenueToday', {
            amount: formatMoney(kpis.revenue.today),
          })}
        />
        <KpiCard
          label={t('admin.overview.kpi.tickets')}
          value={formatNum(kpis.tickets.totalIssued)}
          sub={t('admin.overview.kpi.checkedIn', {
            n: formatNum(kpis.tickets.checkedIn),
          })}
        />
        <KpiCard
          label={t('admin.overview.kpi.users')}
          value={formatNum(kpis.users.total)}
          sub={t('admin.overview.kpi.usersNew', {
            today: formatNum(kpis.users.newToday),
            month: formatNum(kpis.users.last30d),
          })}
        />
        <KpiCard
          label={t('admin.overview.kpi.events')}
          value={formatNum(kpis.events.published)}
          sub={`${formatNum(kpis.events.pendingReview)} ${t('admin.overview.kpi.pending')} · ${formatNum(kpis.events.draft)} ${t('admin.overview.kpi.draft')}`}
        />
        <KpiCard
          label={t('admin.overview.kpi.companies')}
          value={formatNum(kpis.companies.active)}
          sub={`${formatNum(kpis.companies.pending)} ${t('admin.overview.kpi.pending')}`}
        />
        <KpiCard
          label={t('admin.overview.kpi.marketplaceGmv')}
          value={formatMoney(kpis.marketplace.gmv)}
          sub={`${formatNum(kpis.marketplace.activeListings)} ${t('admin.overview.kpi.active')} · ${formatNum(kpis.marketplace.soldCount)} ${t('admin.overview.kpi.sold')}`}
          accent="magenta"
        />
        <KpiCard
          label={t('admin.overview.kpi.payoutsPending')}
          value={formatMoney(
            kpis.payouts.pendingEvent.amount + kpis.payouts.payable.amount,
          )}
          sub={`${formatNum(kpis.payouts.payable.count)} ${t('admin.overview.kpi.payable')} · ${formatNum(kpis.payouts.pendingEvent.count)} ${t('admin.overview.kpi.escrow')}`}
        />
      </div>

      {/* Charts */}
      <div className={Styles.chartGrid}>
        <ChartCard
          title={t('admin.overview.charts.revenue')}
          series={series.revenueByDay.map((d) => ({
            label: d.day,
            value: d.revenue,
          }))}
          color="#d7ff3a"
          formatter={(v) => formatMoney(v)}
        />
        <ChartCard
          title={t('admin.overview.charts.tickets')}
          series={series.ticketsByDay.map((d) => ({
            label: d.day,
            value: d.count,
          }))}
          color="#ff2e93"
          formatter={(v) => formatNum(v)}
        />
        <ChartCard
          title={t('admin.overview.charts.signups')}
          series={series.signupsByDay.map((d) => ({
            label: d.day,
            value: d.count,
          }))}
          color="#5eeac7"
          formatter={(v) => formatNum(v)}
        />
      </div>

      {/* Top tables */}
      <div className={Styles.topGrid}>
        <div className={Styles.topCard}>
          <div className={Styles.topTitle}>
            {t('admin.overview.top.events')}
          </div>
          {top.topEventsByRevenue.length === 0 ? (
            <div className={Styles.emptyMini}>
              {t('admin.overview.top.empty')}
            </div>
          ) : (
            <table className={Styles.topTable}>
              <thead>
                <tr>
                  <th>{t('admin.overview.top.event')}</th>
                  <th align="right">{t('admin.overview.top.revenue')}</th>
                  <th align="right">{t('admin.overview.top.tickets')}</th>
                </tr>
              </thead>
              <tbody>
                {top.topEventsByRevenue.map((e) => (
                  <tr key={e.eventId}>
                    <td>
                      <Link to={`/admin/events/${e.eventId}`}>{e.title}</Link>
                      <div className={Styles.topSlug}>/{e.slug}</div>
                    </td>
                    <td align="right">{formatMoney(e.revenue)}</td>
                    <td align="right">{formatNum(e.ticketsSold)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={Styles.topCard}>
          <div className={Styles.topTitle}>
            {t('admin.overview.top.organizers')}
          </div>
          {top.topOrganizersByGmv.length === 0 ? (
            <div className={Styles.emptyMini}>
              {t('admin.overview.top.empty')}
            </div>
          ) : (
            <table className={Styles.topTable}>
              <thead>
                <tr>
                  <th>{t('admin.overview.top.organizer')}</th>
                  <th align="right">{t('admin.overview.top.gmv')}</th>
                  <th align="right">{t('admin.overview.top.events')}</th>
                </tr>
              </thead>
              <tbody>
                {top.topOrganizersByGmv.map((o) => (
                  <tr key={o.companyId}>
                    <td>
                      <strong>{o.name}</strong>
                      <div className={Styles.topSlug}>@{o.slug}</div>
                    </td>
                    <td align="right">{formatMoney(o.gmv)}</td>
                    <td align="right">{formatNum(o.eventsCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={Styles.generated}>
        {t('admin.overview.generated', {
          ts: new Date(data.generatedAt).toLocaleString(),
        })}
      </div>
    </div>
  );
};

const HealthBadge: React.FC<{
  label: string;
  tone: 'ok' | 'warn' | 'bad';
  value: string;
}> = ({ label, tone, value }) => (
  <div
    className={`${Styles.healthBadge} ${tone === 'ok' ? Styles.healthOk : tone === 'warn' ? Styles.healthWarn : Styles.healthBad}`}
  >
    <span className={Styles.healthDot} />
    <span className={Styles.healthLabel}>{label}</span>
    <span className={Styles.healthValue}>{value}</span>
  </div>
);

const KpiCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: 'lime' | 'magenta';
}> = ({ label, value, sub, accent }) => (
  <div
    className={`${Styles.kpi} ${accent === 'lime' ? Styles.kpiLime : accent === 'magenta' ? Styles.kpiMagenta : ''}`}
  >
    <div className={Styles.kpiLabel}>{label}</div>
    <div className={Styles.kpiValue}>{value}</div>
    {sub && <div className={Styles.kpiSub}>{sub}</div>}
  </div>
);

const ChartCard: React.FC<{
  title: string;
  series: Array<{ label: string; value: number }>;
  color: string;
  formatter: (v: number) => string;
}> = ({ title, series, color, formatter }) => {
  const max = Math.max(1, ...series.map((s) => s.value));
  const total = series.reduce((acc, s) => acc + s.value, 0);
  const W = 600;
  const H = 120;
  const stepX = series.length > 1 ? W / (series.length - 1) : W;
  const points = series
    .map((s, i) => {
      const x = i * stepX;
      const y = H - (s.value / max) * (H - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPath =
    series.length === 0
      ? ''
      : `M0,${H} L${points.split(' ').join(' L')} L${W},${H} Z`;
  return (
    <div className={Styles.chart}>
      <div className={Styles.chartHead}>
        <div className={Styles.chartTitle}>{title}</div>
        <div className={Styles.chartTotal}>{formatter(total)}</div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={Styles.chartSvg}
      >
        <path d={areaPath} fill={color} opacity="0.18" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className={Styles.chartFoot}>
        <span>{series[0]?.label?.slice(5) ?? ''}</span>
        <span>{series[series.length - 1]?.label?.slice(5) ?? ''}</span>
      </div>
    </div>
  );
};

const formatUptime = (sec: number): string => {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
};

void formatPct; // keep helper available for future percentage cards

export default DashboardOverview;

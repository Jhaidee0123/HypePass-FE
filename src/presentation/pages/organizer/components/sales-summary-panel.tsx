import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OrganizerEvents } from '@/domain/usecases';
import { SalesSummary, SalesSummarySection } from '@/domain/models';
import { CourtesyModal } from './courtesy-modal';

type Props = {
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
};

const formatMoney = (minorUnits: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minorUnits / 100);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const pct = (sold: number, capacity: number) =>
  capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

export const SalesSummaryPanel: React.FC<Props> = ({
  events,
  companyId,
  eventId,
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courtesyOpen, setCourtesyOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await events.getSalesSummary(companyId, eventId);
      setData(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  }, [events, companyId, eventId, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontSize: 13,
            color: '#908b83',
          }}
        >
          {t('organizer.events.sales.description')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setCourtesyOpen(true)}
            disabled={!data || data.sessions.length === 0}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: '#d7ff3a',
              color: '#0a0908',
              border: 'none',
              padding: '8px 14px',
              cursor:
                !data || data.sessions.length === 0
                  ? 'not-allowed'
                  : 'pointer',
              opacity: !data || data.sessions.length === 0 ? 0.5 : 1,
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {t('organizer.events.courtesies.cta')}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: '#d7ff3a',
              border: '1px solid #34312c',
              padding: '8px 14px',
              cursor: loading ? 'wait' : 'pointer',
              borderRadius: 4,
            }}
          >
            {loading
              ? t('common.loading')
              : t('organizer.events.sales.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: '#ff4d5a',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <>
          <TotalsRow label={t('organizer.events.sales.eventTotals')} totals={data.totals} />

          <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
            {data.sessions.length === 0 && (
              <div style={{ color: '#908b83', fontSize: 13 }}>
                {t('organizer.events.sales.empty')}
              </div>
            )}
            {data.sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  border: '1px solid #242320',
                  borderRadius: 6,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'Bebas Neue, Impact, sans-serif',
                        fontSize: 22,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {session.name ?? t('organizer.events.sales.defaultSession')}
                    </div>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: '#6b6760',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {formatDate(session.startsAt)} → {formatDate(session.endsAt)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: '#d7ff3a',
                    }}
                  >
                    {session.totals.sold}/{session.totals.capacity}{' '}
                    ({pct(session.totals.sold, session.totals.capacity)}%)
                  </div>
                </div>

                {session.sections.length === 0 ? (
                  <div style={{ color: '#908b83', fontSize: 13 }}>
                    {t('organizer.events.sales.emptySections')}
                  </div>
                ) : (
                  <SectionsTable sections={session.sections} />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {data && (
        <CourtesyModal
          events={events}
          companyId={companyId}
          eventId={eventId}
          sessions={data.sessions}
          open={courtesyOpen}
          onClose={() => setCourtesyOpen(false)}
          onIssued={() => {
            setCourtesyOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
};

const TotalsRow: React.FC<{
  label: string;
  totals: SalesSummary['totals'];
}> = ({ label, totals }) => {
  const { t } = useTranslation();
  const cells: Array<{ k: string; v: string; accent?: boolean }> = [
    { k: label, v: `${totals.sold}/${totals.capacity}`, accent: true },
    { k: t('organizer.events.sales.checkedIn'), v: String(totals.checkedIn) },
    { k: t('organizer.events.sales.reserved'), v: String(totals.reserved) },
    {
      k: t('organizer.events.sales.courtesies'),
      v: String(totals.courtesies),
    },
    { k: t('organizer.events.sales.available'), v: String(totals.available) },
    {
      k: t('organizer.events.sales.revenue'),
      v: formatMoney(totals.grossRevenue, totals.currency),
    },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
      }}
    >
      {cells.map((c) => (
        <div
          key={c.k}
          style={{
            background: '#121110',
            border: '1px solid #242320',
            borderRadius: 6,
            padding: 14,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: '#6b6760',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {c.k}
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 24,
              color: c.accent ? '#d7ff3a' : '#faf7f0',
              letterSpacing: '0.02em',
            }}
          >
            {c.v}
          </div>
        </div>
      ))}
    </div>
  );
};

const SectionsTable: React.FC<{ sections: SalesSummarySection[] }> = ({
  sections,
}) => {
  const { t } = useTranslation();
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ textAlign: 'left', color: '#6b6760' }}>
            <Th>{t('organizer.events.sales.section')}</Th>
            <Th align="right">{t('organizer.events.sales.capacity')}</Th>
            <Th align="right">{t('organizer.events.sales.sold')}</Th>
            <Th align="right">{t('organizer.events.sales.checkedIn')}</Th>
            <Th align="right">{t('organizer.events.sales.reserved')}</Th>
            <Th align="right">{t('organizer.events.sales.courtesies')}</Th>
            <Th align="right">{t('organizer.events.sales.available')}</Th>
            <Th align="right">{t('organizer.events.sales.revenue')}</Th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <tr
              key={s.id}
              style={{ borderTop: '1px solid #242320', color: '#faf7f0' }}
            >
              <Td>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <ProgressBar sold={s.sold} capacity={s.capacity} />
              </Td>
              <Td align="right">{s.capacity}</Td>
              <Td align="right">
                {s.sold}{' '}
                <span style={{ color: '#6b6760', fontSize: 11 }}>
                  ({pct(s.sold, s.capacity)}%)
                </span>
              </Td>
              <Td align="right">{s.checkedIn}</Td>
              <Td align="right">{s.reserved}</Td>
              <Td align="right">{s.courtesies}</Td>
              <Td align="right" emphasis>
                {s.available}
              </Td>
              <Td align="right">{formatMoney(s.grossRevenue, s.currency)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({
  children,
  align = 'left',
}) => (
  <th
    style={{
      padding: '10px 12px',
      textAlign: align,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: 500,
    }}
  >
    {children}
  </th>
);

const Td: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'right';
  emphasis?: boolean;
}> = ({ children, align = 'left', emphasis }) => (
  <td
    style={{
      padding: '12px',
      textAlign: align,
      color: emphasis ? '#d7ff3a' : undefined,
      fontWeight: emphasis ? 600 : undefined,
    }}
  >
    {children}
  </td>
);

const ProgressBar: React.FC<{ sold: number; capacity: number }> = ({
  sold,
  capacity,
}) => {
  const percent = pct(sold, capacity);
  return (
    <div
      style={{
        marginTop: 6,
        height: 4,
        background: '#242320',
        borderRadius: 2,
        maxWidth: 160,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(100, percent)}%`,
          height: '100%',
          background: percent >= 90 ? '#ff2e93' : '#d7ff3a',
        }}
      />
    </div>
  );
};

export default SalesSummaryPanel;

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '@/presentation/components';
import { EventPromoterRow, EventPromoters } from '@/domain/usecases';
import { EventWithChildren } from '@/domain/models';
import appConfig from '@/main/config/app-config';

type Props = {
  promoters: EventPromoters;
  companyId: string;
  eventId: string;
  eventSlug: string;
  /** Full session list of the event so we can offer a per-session
   *  filter for the aggregates. */
  sessions: EventWithChildren['sessions'];
  onAssignClick?: (current: EventPromoterRow[]) => void;
  refreshSignal?: number;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);

const buildLink = (slug: string, code: string) => {
  const base =
    appConfig.api.ENDPOINT.replace(/\/api\/?$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/events/${slug}?ref=${code}`;
};

export const EventPromotersPanel: React.FC<Props> = ({
  promoters,
  companyId,
  eventId,
  eventSlug,
  sessions,
  onAssignClick,
  refreshSignal,
}) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<EventPromoterRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<EventPromoterRow | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await promoters.list(
        companyId,
        eventId,
        sessionFilter || undefined,
      );
      setRows(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  }, [promoters, companyId, eventId, sessionFilter, t]);

  useEffect(() => {
    void load();
  }, [load, refreshSignal]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await promoters.revoke(companyId, eventId, revokeTarget.userId);
      setRevokeTarget(null);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setRevoking(false);
    }
  };

  const copyLink = async (row: EventPromoterRow) => {
    try {
      const link = buildLink(eventSlug, row.referralCode);
      await navigator.clipboard.writeText(link);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* ignore */
    }
  };

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
            maxWidth: 560,
            lineHeight: 1.5,
          }}
        >
          {t('organizer.events.promoters.description')}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {sessions.length > 1 && (
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.06em',
                background: '#121110',
                color: '#faf7f0',
                border: '1px solid #34312c',
                padding: '8px 12px',
                borderRadius: 4,
                minWidth: 200,
              }}
            >
              <option value="">
                {t('organizer.events.promoters.allSessions')}
              </option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ??
                    new Date(s.startsAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: '2-digit',
                    })}
                </option>
              ))}
            </select>
          )}
          {onAssignClick && (
            <button
              type="button"
              onClick={() => onAssignClick(rows ?? [])}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: '#d7ff3a',
                color: '#0a0908',
                border: 'none',
                padding: '8px 14px',
                cursor: 'pointer',
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              {t('organizer.events.promoters.cta')}
            </button>
          )}
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
              : t('organizer.events.promoters.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ff4d5a', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {rows && rows.length === 0 && (
        <div
          style={{
            border: '1px dashed #34312c',
            padding: '40px 20px',
            borderRadius: 6,
            textAlign: 'center',
            color: '#908b83',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {t('organizer.events.promoters.empty')}
        </div>
      )}

      {rows && rows.length > 0 && (
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
                <Th>{t('organizer.events.promoters.fields.name')}</Th>
                <Th>{t('organizer.events.promoters.fields.code')}</Th>
                <Th>{t('organizer.events.promoters.fields.tickets')}</Th>
                <Th>{t('organizer.events.promoters.fields.revenue')}</Th>
                <Th>{t('organizer.events.promoters.fields.status')}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderTop: '1px solid #242320',
                    color: '#faf7f0',
                    opacity: p.revokedAt ? 0.55 : 1,
                  }}
                >
                  <Td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#908b83', marginTop: 2 }}>
                      {p.email}
                    </div>
                    {p.note && (
                      <div style={{ fontSize: 11, color: '#6b6760', marginTop: 4 }}>
                        {p.note}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 13,
                        color: '#d7ff3a',
                        background: 'rgba(215, 255, 58, 0.08)',
                        padding: '4px 10px',
                        borderRadius: 4,
                        display: 'inline-block',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {p.referralCode}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => copyLink(p)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === p.id ? '#5eeac7' : '#908b83',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {copiedId === p.id
                          ? t('organizer.events.promoters.copied')
                          : t('organizer.events.promoters.copyLink')}
                      </button>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{p.ticketsSold}</div>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#6b6760',
                      }}
                    >
                      {p.ordersCount} {t('organizer.events.promoters.ordersSuffix')}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 600 }}>
                      {formatMoney(p.grossRevenue, p.currency)}
                    </div>
                  </Td>
                  <Td>
                    {p.revokedAt ? (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          background: 'rgba(255, 77, 90, 0.18)',
                          color: '#ff4d5a',
                          borderRadius: 3,
                        }}
                      >
                        {t('organizer.events.promoters.statusRevoked')}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          background: 'rgba(94, 234, 199, 0.12)',
                          color: '#5eeac7',
                          borderRadius: 3,
                        }}
                      >
                        {t('organizer.events.promoters.statusActive')}
                      </span>
                    )}
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#6b6760',
                        marginTop: 4,
                      }}
                    >
                      {formatDate(p.createdAt)}
                    </div>
                  </Td>
                  <Td align="right">
                    {!p.revokedAt && (
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(p)}
                        style={{
                          background: 'transparent',
                          color: '#ff4d5a',
                          border: '1px solid #34312c',
                          borderRadius: 4,
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '6px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        {t('organizer.events.promoters.revoke')}
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!revokeTarget}
        eyebrow={t('organizer.events.promoters.eyebrow')}
        title={t('organizer.events.promoters.revokeConfirmTitle')}
        body={
          revokeTarget
            ? t('organizer.events.promoters.revokeConfirmBody', {
                name: revokeTarget.name,
                email: revokeTarget.email,
              })
            : undefined
        }
        confirmLabel={t('organizer.events.promoters.revoke')}
        variant="danger"
        busy={revoking}
        onConfirm={handleRevoke}
        onCancel={() => {
          if (!revoking) setRevokeTarget(null);
        }}
      />
    </div>
  );
};

const Th: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <th
    style={{
      padding: '10px 12px',
      textAlign: 'left',
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
}> = ({ children, align = 'left' }) => (
  <td style={{ padding: '12px', textAlign: align, verticalAlign: 'top' }}>
    {children}
  </td>
);

export default EventPromotersPanel;

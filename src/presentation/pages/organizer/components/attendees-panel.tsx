import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EventAttendeeRow,
  EventAttendeesQuery,
  OrganizerEvents,
} from '@/domain/usecases';
import { EventWithChildren } from '@/domain/models';

type Props = {
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
  /** Used to populate the session/section filters. */
  sessions: EventWithChildren['sessions'];
};

const PAGE_SIZE = 50;

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);

const csvEscape = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadCsv = (rows: EventAttendeeRow[]) => {
  const headers = [
    'fecha',
    'tipo',
    'estado',
    'sesion',
    'seccion',
    'comprador',
    'comprador_email',
    'titular_actual',
    'titular_email',
    'transferido',
    'codigo_promotor',
    'referencia_pago',
    'valor',
    'moneda',
    'ticket_id',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        new Date(r.issuedAt).toISOString(),
        r.type,
        r.status,
        r.sessionName ?? r.sessionId,
        r.sectionName,
        r.buyerFullName ?? '',
        r.buyerEmail ?? '',
        r.ownerName ?? '',
        r.ownerEmail ?? '',
        r.transferred ? 'true' : 'false',
        r.promoterReferralCode ?? '',
        r.paymentReference ?? '',
        r.faceValue,
        r.currency,
        r.ticketId,
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asistentes-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const AttendeesPanel: React.FC<Props> = ({
  events,
  companyId,
  eventId,
  sessions,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<EventAttendeesQuery>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [rows, setRows] = useState<EventAttendeeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionsByEvent = useMemo(() => {
    if (query.sessionId) {
      return (
        sessions.find((s) => s.id === query.sessionId)?.sections ?? []
      );
    }
    return sessions.flatMap((s) => s.sections);
  }, [sessions, query.sessionId]);

  const load = useCallback(
    async (next = query) => {
      setLoading(true);
      setError(null);
      try {
        const res = await events.listAttendees(companyId, eventId, next);
        setRows(res.items);
        setTotal(res.total);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            t('errors.unexpected'),
        );
      } finally {
        setLoading(false);
      }
    },
    [events, companyId, eventId, query, t],
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (patch: Partial<EventAttendeesQuery>) => {
    const next = { ...query, ...patch, offset: 0 };
    setQuery(next);
    void load(next);
  };

  const goPage = (offset: number) => {
    const next = { ...query, offset };
    setQuery(next);
    void load(next);
  };

  const limit = query.limit ?? PAGE_SIZE;
  const offset = query.offset ?? 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 14,
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
          {t('organizer.events.attendees.description')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => downloadCsv(rows)}
            disabled={rows.length === 0}
            style={btnSecondary}
          >
            {t('organizer.events.attendees.exportCsv')}
          </button>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            style={btnSecondary}
          >
            {loading
              ? t('common.loading')
              : t('organizer.events.attendees.refresh')}
          </button>
        </div>
      </div>

      {/* filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <Field label={t('organizer.events.attendees.filter.session')}>
          <select
            value={query.sessionId ?? ''}
            onChange={(e) =>
              apply({
                sessionId: e.target.value || undefined,
                sectionId: undefined,
              })
            }
            style={inputStyle}
          >
            <option value="">
              {t('organizer.events.attendees.filter.allSessions')}
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ?? new Date(s.startsAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('organizer.events.attendees.filter.section')}>
          <select
            value={query.sectionId ?? ''}
            onChange={(e) =>
              apply({ sectionId: e.target.value || undefined })
            }
            style={inputStyle}
          >
            <option value="">
              {t('organizer.events.attendees.filter.allSections')}
            </option>
            {sectionsByEvent.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('organizer.events.attendees.filter.type')}>
          <select
            value={query.type ?? ''}
            onChange={(e) =>
              apply({
                type:
                  (e.target.value || undefined) as
                    | 'paid'
                    | 'courtesy'
                    | undefined,
              })
            }
            style={inputStyle}
          >
            <option value="">
              {t('organizer.events.attendees.filter.allTypes')}
            </option>
            <option value="paid">
              {t('organizer.events.attendees.typePaid')}
            </option>
            <option value="courtesy">
              {t('organizer.events.attendees.typeCourtesy')}
            </option>
          </select>
        </Field>
        <Field label={t('organizer.events.attendees.filter.search')}>
          <input
            type="search"
            value={query.q ?? ''}
            onChange={(e) => setQuery((p) => ({ ...p, q: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') apply({ q: query.q });
            }}
            placeholder={t(
              'organizer.events.attendees.filter.searchPlaceholder',
            )}
            style={inputStyle}
          />
        </Field>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(255, 77, 90, 0.08)',
            border: '1px solid #ff4d5a',
            color: '#ff4d5a',
            borderRadius: 4,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#908b83',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}
      >
        <span>
          {t('organizer.events.attendees.summary', {
            from: total === 0 ? 0 : offset + 1,
            to: Math.min(total, offset + rows.length),
            total,
          })}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => goPage(0)}
            disabled={loading || offset === 0}
            style={pageBtn}
          >
            «
          </button>
          <button
            type="button"
            onClick={() => goPage(Math.max(0, offset - limit))}
            disabled={loading || offset === 0}
            style={pageBtn}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => goPage(offset + limit)}
            disabled={loading || offset + limit >= total}
            style={pageBtn}
          >
            →
          </button>
        </div>
      </div>

      {rows.length === 0 && !loading ? (
        <div
          style={{
            padding: '40px 20px',
            border: '1px dashed #34312c',
            borderRadius: 6,
            textAlign: 'center',
            color: '#908b83',
            fontSize: 13,
          }}
        >
          {t('organizer.events.attendees.empty')}
        </div>
      ) : (
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
                <Th>{t('organizer.events.attendees.cols.date')}</Th>
                <Th>{t('organizer.events.attendees.cols.holder')}</Th>
                <Th>{t('organizer.events.attendees.cols.session')}</Th>
                <Th>{t('organizer.events.attendees.cols.section')}</Th>
                <Th>{t('organizer.events.attendees.cols.type')}</Th>
                <Th>{t('organizer.events.attendees.cols.status')}</Th>
                <Th>{t('organizer.events.attendees.cols.promoter')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const displayName = r.transferred
                  ? r.ownerName ?? r.buyerFullName
                  : r.buyerFullName ?? r.ownerName;
                const displayEmail = r.transferred
                  ? r.ownerEmail ?? r.buyerEmail
                  : r.buyerEmail ?? r.ownerEmail;
                return (
                  <tr
                    key={r.ticketId}
                    style={{ borderTop: '1px solid #242320', color: '#faf7f0' }}
                  >
                    <Td>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          color: '#908b83',
                        }}
                      >
                        {new Date(r.issuedAt).toLocaleString()}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{displayName ?? '—'}</div>
                      <div
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          color: '#908b83',
                        }}
                      >
                        {displayEmail ?? '—'}
                      </div>
                      {r.transferred && (
                        <div
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 9,
                            letterSpacing: '0.12em',
                            color: '#ffb454',
                            marginTop: 2,
                          }}
                        >
                          {t('organizer.events.attendees.transferred', {
                            from: r.buyerEmail ?? '—',
                          })}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          color: '#bfbab1',
                        }}
                      >
                        {r.sessionName ??
                          new Date(r.sessionStartsAt).toLocaleDateString()}
                      </span>
                    </Td>
                    <Td>{r.sectionName}</Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          letterSpacing: '0.14em',
                          padding: '3px 8px',
                          borderRadius: 3,
                          background:
                            r.type === 'courtesy'
                              ? 'rgba(255, 180, 84, 0.15)'
                              : 'rgba(94, 234, 199, 0.12)',
                          color:
                            r.type === 'courtesy' ? '#ffb454' : '#5eeac7',
                        }}
                      >
                        {r.type === 'courtesy'
                          ? t('organizer.events.attendees.typeCourtesy')
                          : t('organizer.events.attendees.typePaid')}
                      </span>
                      {r.type === 'paid' && r.faceValue > 0 && (
                        <div
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 11,
                            color: '#6b6760',
                            marginTop: 4,
                          }}
                        >
                          {formatMoney(r.faceValue, r.currency)}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          color: '#bfbab1',
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.status}
                      </span>
                    </Td>
                    <Td>
                      {r.promoterReferralCode ? (
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 11,
                            color: '#d7ff3a',
                            background: 'rgba(215, 255, 58, 0.06)',
                            padding: '3px 8px',
                            borderRadius: 3,
                          }}
                        >
                          {r.promoterReferralCode}
                        </span>
                      ) : (
                        <span style={{ color: '#6b6760' }}>—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: '#908b83',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
    {children}
  </label>
);

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

const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td style={{ padding: '12px', verticalAlign: 'top' }}>{children}</td>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1917',
  border: '1px solid #34312c',
  color: '#faf7f0',
  padding: '8px 10px',
  borderRadius: 4,
  fontFamily: 'Space Grotesk, system-ui, sans-serif',
  fontSize: 13,
  outline: 'none',
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent',
  color: '#d7ff3a',
  border: '1px solid #34312c',
  padding: '8px 14px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  borderRadius: 4,
  cursor: 'pointer',
};

const pageBtn: React.CSSProperties = {
  background: '#121110',
  border: '1px solid #34312c',
  color: '#faf7f0',
  padding: '4px 10px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  borderRadius: 4,
  cursor: 'pointer',
};

export default AttendeesPanel;

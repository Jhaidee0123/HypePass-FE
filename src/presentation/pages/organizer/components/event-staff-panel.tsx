import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '@/presentation/components';
import { OrganizerEvents } from '@/domain/usecases';
import { EventStaffMember } from '@/domain/usecases';

type Props = {
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
  /**
   * Triggered when the user clicks "Assign staff". The host page decides
   * how to render the modal. Receives the current list so the modal can
   * avoid re-adding already-assigned emails.
   */
  onAssignClick?: (current: EventStaffMember[]) => void;
  /** Bumped by the host to force a refresh after an assignment completes. */
  refreshSignal?: number;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const EventStaffPanel: React.FC<Props> = ({
  events,
  companyId,
  eventId,
  onAssignClick,
  refreshSignal,
}) => {
  const { t } = useTranslation();
  const [staff, setStaff] = useState<EventStaffMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<EventStaffMember | null>(
    null,
  );
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await events.listEventStaff(companyId, eventId);
      setStaff(res);
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
  }, [load, refreshSignal]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await events.revokeEventStaff(companyId, eventId, revokeTarget.userId);
      setRevokeTarget(null);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setRevoking(false);
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
          {t('organizer.events.staff.description')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onAssignClick && (
            <button
              type="button"
              onClick={() => onAssignClick(staff ?? [])}
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
              {t('organizer.events.staff.cta')}
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
              : t('organizer.events.staff.refresh')}
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

      {staff && staff.length === 0 && (
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
          {t('organizer.events.staff.empty')}
        </div>
      )}

      {staff && staff.length > 0 && (
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
                <Th>{t('organizer.events.staff.fields.name')}</Th>
                <Th>{t('organizer.events.staff.fields.email')}</Th>
                <Th>{t('organizer.events.staff.fields.role')}</Th>
                <Th>{t('organizer.events.staff.fields.note')}</Th>
                <Th>{t('organizer.events.staff.fields.assignedAt')}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr
                  key={s.id}
                  style={{ borderTop: '1px solid #242320', color: '#faf7f0' }}
                >
                  <Td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                  </Td>
                  <Td>
                    <span className="mono" style={{ fontSize: 12 }}>
                      {s.email}
                    </span>
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        background: '#242320',
                        color: '#d7ff3a',
                        borderRadius: 3,
                      }}
                    >
                      {t(`organizer.events.staff.roles.${s.role}`)}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ color: '#908b83' }}>{s.note ?? '—'}</span>
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: '#6b6760',
                      }}
                    >
                      {formatDate(s.createdAt)}
                    </span>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => setRevokeTarget(s)}
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
                      {t('organizer.events.staff.revoke')}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!revokeTarget}
        eyebrow={t('organizer.events.staff.eyebrow')}
        title={t('organizer.events.staff.revokeConfirmTitle')}
        body={
          revokeTarget
            ? t('organizer.events.staff.revokeConfirmBody', {
                name: revokeTarget.name,
                email: revokeTarget.email,
              })
            : undefined
        }
        confirmLabel={t('organizer.events.staff.revoke')}
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

export default EventStaffPanel;

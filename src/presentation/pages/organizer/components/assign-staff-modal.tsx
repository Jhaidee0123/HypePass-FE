import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssignStaffRecipientInput,
  EventStaffMember,
  EventStaffRoleValue,
  OrganizerEvents,
} from '@/domain/usecases';

type Props = {
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
  /** Existing assignments so we can warn the user about duplicates inline. */
  current: EventStaffMember[];
  open: boolean;
  onClose: () => void;
  /** Called after a successful assignment. Host should refresh the panel. */
  onAssigned: () => void;
};

type RecipientDraft = AssignStaffRecipientInput;

const EMPTY_RECIPIENT: RecipientDraft = {
  fullName: '',
  email: '',
  role: 'checkin_staff',
  note: '',
};

const AVAILABLE_ROLES: EventStaffRoleValue[] = ['checkin_staff'];

export const AssignStaffModal: React.FC<Props> = ({
  events,
  companyId,
  eventId,
  current,
  open,
  onClose,
  onAssigned,
}) => {
  const { t } = useTranslation();
  const [recipients, setRecipients] = useState<RecipientDraft[]>([
    { ...EMPTY_RECIPIENT },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    assigned: number;
    created: string[];
    reused: string[];
    alreadyAssigned: string[];
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setResult(null);
    setRecipients([{ ...EMPTY_RECIPIENT }]);
  }, [open]);

  const alreadyAssignedEmails = useMemo(
    () => new Set(current.map((c) => c.email.toLowerCase())),
    [current],
  );

  const duplicateInForm = useMemo(() => {
    const seen = new Set<string>();
    for (const r of recipients) {
      const k = `${r.email.trim().toLowerCase()}|${r.role}`;
      if (!r.email.trim()) continue;
      if (seen.has(k)) return true;
      seen.add(k);
    }
    return false;
  }, [recipients]);

  const canSubmit =
    recipients.length > 0 &&
    !submitting &&
    !duplicateInForm &&
    recipients.every(
      (r) =>
        r.fullName.trim() !== '' &&
        /^\S+@\S+\.\S+$/.test(r.email) &&
        !!r.role,
    );

  const updateRecipient = (index: number, patch: Partial<RecipientDraft>) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const addRecipient = () =>
    setRecipients((prev) => [...prev, { ...EMPTY_RECIPIENT }]);

  const removeRecipient = (index: number) =>
    setRecipients((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await events.assignEventStaff(companyId, eventId, {
        recipients: recipients.map((r) => ({
          fullName: r.fullName.trim(),
          email: r.email.trim().toLowerCase(),
          role: r.role,
          note: r.note?.trim() ? r.note.trim() : undefined,
        })),
      });
      setResult({
        assigned: res.assigned.length,
        created: res.createdAccounts,
        reused: res.reusedAccounts,
        alreadyAssigned: res.alreadyAssigned,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0a0908',
          border: '1px solid #242320',
          borderRadius: 8,
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 28,
          color: '#faf7f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                color: '#6b6760',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              ◆ {t('organizer.events.staff.eyebrow')}
            </div>
            <h2
              style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 36,
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              {t('organizer.events.staffModal.title')}
            </h2>
            <p
              style={{
                color: '#908b83',
                fontSize: 13,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {t('organizer.events.staffModal.description')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            style={{
              background: 'transparent',
              color: '#908b83',
              border: '1px solid #34312c',
              borderRadius: 4,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {result ? (
          <ResultView
            result={result}
            onClose={() => {
              onAssigned();
            }}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: '#6b6760',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              {t('organizer.events.staffModal.recipients', {
                count: recipients.length,
              })}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {recipients.map((r, i) => {
                const emailNorm = r.email.trim().toLowerCase();
                const warnAlready =
                  emailNorm !== '' && alreadyAssignedEmails.has(emailNorm);
                return (
                  <div
                    key={i}
                    style={{
                      border: '1px solid #242320',
                      borderRadius: 6,
                      padding: 14,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                      }}
                    >
                      <TextField
                        label={t('organizer.events.staffModal.fields.fullName')}
                        value={r.fullName}
                        onChange={(v) => updateRecipient(i, { fullName: v })}
                        placeholder="María Pérez"
                      />
                      <TextField
                        label={t('organizer.events.staffModal.fields.email')}
                        value={r.email}
                        type="email"
                        onChange={(v) => updateRecipient(i, { email: v })}
                        placeholder="maria@email.com"
                      />
                      <SelectField
                        label={t('organizer.events.staffModal.fields.role')}
                        value={r.role}
                        onChange={(v) =>
                          updateRecipient(i, {
                            role: v as EventStaffRoleValue,
                          })
                        }
                        options={AVAILABLE_ROLES.map((rr) => ({
                          value: rr,
                          label: t(`organizer.events.staff.roles.${rr}`),
                        }))}
                      />
                      <TextField
                        label={t('organizer.events.staffModal.fields.note')}
                        value={r.note ?? ''}
                        onChange={(v) => updateRecipient(i, { note: v })}
                        placeholder={t(
                          'organizer.events.staffModal.fields.notePlaceholder',
                        )}
                      />
                    </div>
                    {warnAlready && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          color: '#ffb454',
                          fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.05em',
                        }}
                      >
                        ⚠ {t('organizer.events.staffModal.alreadyAssigned')}
                      </div>
                    )}
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecipient(i)}
                        aria-label={t('common.remove')}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'transparent',
                          color: '#ff4d5a',
                          border: '1px solid #34312c',
                          borderRadius: 4,
                          fontSize: 11,
                          padding: '4px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        {t('common.remove')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                onClick={addRecipient}
                style={{
                  background: 'transparent',
                  color: '#d7ff3a',
                  border: '1px dashed #34312c',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '8px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                + {t('organizer.events.staffModal.addRecipient')}
              </button>
            </div>

            {duplicateInForm && (
              <div
                style={{
                  marginTop: 14,
                  color: '#ff4d5a',
                  fontSize: 13,
                }}
              >
                {t('organizer.events.staffModal.duplicateInForm')}
              </div>
            )}

            {error && (
              <div style={{ marginTop: 14, color: '#ff4d5a', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  color: '#908b83',
                  border: '1px solid #34312c',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  background: canSubmit ? '#d7ff3a' : '#34312c',
                  color: canSubmit ? '#0a0908' : '#6b6760',
                  border: 'none',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: 4,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                }}
              >
                {submitting
                  ? t('common.loading')
                  : t('organizer.events.staffModal.submit', {
                      count: recipients.length,
                    })}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ResultView: React.FC<{
  result: {
    assigned: number;
    created: string[];
    reused: string[];
    alreadyAssigned: string[];
  };
  onClose: () => void;
}> = ({ result, onClose }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div
        style={{
          background: 'rgba(94, 234, 199, 0.12)',
          border: '1px solid #5eeac7',
          borderRadius: 6,
          padding: 16,
          color: '#5eeac7',
          marginBottom: 16,
        }}
      >
        {t('organizer.events.staffModal.successBody', {
          count: result.assigned,
        })}
      </div>
      {result.created.length > 0 && (
        <ResultList
          label={t('organizer.events.staffModal.created')}
          emails={result.created}
        />
      )}
      {result.reused.length > 0 && (
        <ResultList
          label={t('organizer.events.staffModal.reused')}
          emails={result.reused}
        />
      )}
      {result.alreadyAssigned.length > 0 && (
        <ResultList
          label={t('organizer.events.staffModal.alreadyAssignedList')}
          emails={result.alreadyAssigned}
          tone="warn"
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#d7ff3a',
            color: '#0a0908',
            border: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '10px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {t('common.done')}
        </button>
      </div>
    </div>
  );
};

const ResultList: React.FC<{
  label: string;
  emails: string[];
  tone?: 'default' | 'warn';
}> = ({ label, emails, tone = 'default' }) => (
  <div style={{ marginBottom: 12 }}>
    <div
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: tone === 'warn' ? '#ffb454' : '#6b6760',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <ul style={{ paddingLeft: 16, color: '#bfbab1' }}>
      {emails.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  </div>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
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
      {label}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: '#121110',
        border: '1px solid #242320',
        color: '#faf7f0',
        borderRadius: 4,
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
        fontSize: 13,
        outline: 'none',
      }}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
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
      {label}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: '#121110',
        border: '1px solid #242320',
        color: '#faf7f0',
        borderRadius: 4,
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
        fontSize: 13,
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default AssignStaffModal;

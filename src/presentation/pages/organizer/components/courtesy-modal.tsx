import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OrganizerEvents, CourtesyRecipientInput } from '@/domain/usecases';
import { SalesSummarySession } from '@/domain/models';

type Props = {
  events: OrganizerEvents;
  companyId: string;
  eventId: string;
  sessions: SalesSummarySession[];
  open: boolean;
  onClose: () => void;
  onIssued: () => void;
};

type RecipientDraft = CourtesyRecipientInput;

const EMPTY_RECIPIENT: RecipientDraft = {
  fullName: '',
  email: '',
  legalId: '',
  legalIdType: 'CC',
  note: '',
};

export const CourtesyModal: React.FC<Props> = ({
  events,
  companyId,
  eventId,
  sessions,
  open,
  onClose,
  onIssued,
}) => {
  const { t } = useTranslation();
  const [sessionId, setSessionId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [recipients, setRecipients] = useState<RecipientDraft[]>([
    { ...EMPTY_RECIPIENT },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    issued: number;
    created: string[];
    reused: string[];
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setResult(null);
    setRecipients([{ ...EMPTY_RECIPIENT }]);
    const first = sessions[0];
    setSessionId(first?.id ?? '');
    const firstSection = first?.sections[0];
    setSectionId(firstSection?.id ?? '');
  }, [open, sessions]);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === sessionId) ?? null,
    [sessions, sessionId],
  );

  const selectedSection = useMemo(
    () =>
      selectedSession?.sections.find((s) => s.id === sectionId) ?? null,
    [selectedSession, sectionId],
  );

  const availableHere = selectedSection?.available ?? 0;
  const overCapacity = recipients.length > availableHere;

  const canSubmit =
    !!sessionId &&
    !!sectionId &&
    recipients.length > 0 &&
    !submitting &&
    !overCapacity &&
    recipients.every(
      (r) =>
        r.fullName.trim() !== '' &&
        /^\S+@\S+\.\S+$/.test(r.email) &&
        r.legalId.trim() !== '' &&
        r.legalIdType.trim() !== '',
    );

  const updateRecipient = (
    index: number,
    patch: Partial<RecipientDraft>,
  ) => {
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
      const res = await events.issueCourtesies(companyId, eventId, {
        eventSessionId: sessionId,
        ticketSectionId: sectionId,
        recipients: recipients.map((r) => ({
          fullName: r.fullName.trim(),
          email: r.email.trim().toLowerCase(),
          legalId: r.legalId.trim(),
          legalIdType: r.legalIdType.trim().toUpperCase(),
          note: r.note?.trim() ? r.note.trim() : undefined,
        })),
      });
      setResult({
        issued: res.issued.length,
        created: res.createdAccounts,
        reused: res.reusedAccounts,
      });
    } catch (err: any) {
      const code = err?.response?.data?.errorCode;
      const rawMessage = err?.response?.data?.message ?? err?.message;
      // Pull the comma-separated email list out of the BE message:
      // "These email(s) already have a ticket for this session: a@b.com, c@d.com"
      const emails =
        typeof rawMessage === 'string' && rawMessage.includes(': ')
          ? rawMessage.slice(rawMessage.indexOf(': ') + 2)
          : '';
      const friendly =
        code === 'EMAIL_ALREADY_HAS_TICKET'
          ? t('organizer.events.courtesies.errors.emailAlreadyHasTicket', {
              emails,
            })
          : null;
      setError(friendly ?? rawMessage ?? t('errors.unexpected'));
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
              ◆ {t('organizer.events.courtesies.eyebrow')}
            </div>
            <h2
              style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 36,
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              {t('organizer.events.courtesies.title')}
            </h2>
            <p
              style={{
                color: '#908b83',
                fontSize: 13,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {t('organizer.events.courtesies.description')}
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
              {t('organizer.events.courtesies.successBody', {
                count: result.issued,
              })}
            </div>
            {result.created.length > 0 && (
              <div style={{ marginBottom: 12 }}>
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
                  {t('organizer.events.courtesies.created')}
                </div>
                <ul style={{ paddingLeft: 16, color: '#bfbab1' }}>
                  {result.created.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.reused.length > 0 && (
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
                  {t('organizer.events.courtesies.reused')}
                </div>
                <ul style={{ paddingLeft: 16, color: '#bfbab1' }}>
                  {result.reused.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                onClick={onIssued}
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
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <SelectField
                label={t('organizer.events.courtesies.session')}
                value={sessionId}
                onChange={(v) => {
                  setSessionId(v);
                  const s = sessions.find((x) => x.id === v);
                  setSectionId(s?.sections[0]?.id ?? '');
                }}
                options={sessions.map((s) => ({
                  value: s.id,
                  label:
                    (s.name ?? t('organizer.events.sales.defaultSession')) +
                    ' — ' +
                    new Date(s.startsAt).toLocaleDateString(),
                }))}
              />
              <SelectField
                label={t('organizer.events.courtesies.section')}
                value={sectionId}
                onChange={setSectionId}
                options={
                  selectedSession?.sections.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.available} ${t('organizer.events.courtesies.availableShort')})`,
                  })) ?? []
                }
              />
            </div>

            {selectedSection && (
              <div
                style={{
                  background: '#121110',
                  border: '1px solid #242320',
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 20,
                  fontSize: 13,
                  color: '#bfbab1',
                }}
              >
                {t('organizer.events.courtesies.availabilityInfo', {
                  section: selectedSection.name,
                  available: selectedSection.available,
                })}
              </div>
            )}

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
              {t('organizer.events.courtesies.recipients', {
                count: recipients.length,
              })}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {recipients.map((r, i) => (
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
                      label={t('organizer.events.courtesies.fields.fullName')}
                      value={r.fullName}
                      onChange={(v) => updateRecipient(i, { fullName: v })}
                      placeholder="María Pérez"
                    />
                    <TextField
                      label={t('organizer.events.courtesies.fields.email')}
                      value={r.email}
                      type="email"
                      onChange={(v) => updateRecipient(i, { email: v })}
                      placeholder="maria@email.com"
                    />
                    <SelectField
                      label={t('organizer.events.courtesies.fields.legalIdType')}
                      value={r.legalIdType}
                      onChange={(v) => updateRecipient(i, { legalIdType: v })}
                      options={[
                        { value: 'CC', label: 'CC' },
                        { value: 'CE', label: 'CE' },
                        { value: 'NIT', label: 'NIT' },
                        { value: 'PP', label: 'PP' },
                        { value: 'TI', label: 'TI' },
                      ]}
                    />
                    <TextField
                      label={t('organizer.events.courtesies.fields.legalId')}
                      value={r.legalId}
                      onChange={(v) => updateRecipient(i, { legalId: v })}
                      placeholder="1020304050"
                    />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <TextField
                      label={t('organizer.events.courtesies.fields.note')}
                      value={r.note ?? ''}
                      onChange={(v) => updateRecipient(i, { note: v })}
                      placeholder={t(
                        'organizer.events.courtesies.fields.notePlaceholder',
                      )}
                    />
                  </div>
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
              ))}
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
                + {t('organizer.events.courtesies.addRecipient')}
              </button>
            </div>

            {overCapacity && (
              <div
                style={{
                  marginTop: 14,
                  color: '#ff4d5a',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {t('organizer.events.courtesies.overCapacity', {
                  available: availableHere,
                  requested: recipients.length,
                })}
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
                  : t('organizer.events.courtesies.submit', {
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

export default CourtesyModal;

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssignPromoterRecipient,
  EventPromoterRow,
  EventPromoters,
} from '@/domain/usecases';

type Props = {
  promoters: EventPromoters;
  companyId: string;
  eventId: string;
  current: EventPromoterRow[];
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
};

type RecipientDraft = AssignPromoterRecipient;

const EMPTY: RecipientDraft = { fullName: '', email: '', note: '' };

export const AssignPromotersModal: React.FC<Props> = ({
  promoters,
  companyId,
  eventId,
  current,
  open,
  onClose,
  onAssigned,
}) => {
  const { t } = useTranslation();
  const [recipients, setRecipients] = useState<RecipientDraft[]>([{ ...EMPTY }]);
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
    setRecipients([{ ...EMPTY }]);
  }, [open]);

  const alreadyEmails = useMemo(
    () =>
      new Set(
        current.filter((c) => !c.revokedAt).map((c) => c.email.toLowerCase()),
      ),
    [current],
  );

  const duplicateInForm = useMemo(() => {
    const seen = new Set<string>();
    for (const r of recipients) {
      const k = r.email.trim().toLowerCase();
      if (!k) continue;
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
      (r) => r.fullName.trim() !== '' && /^\S+@\S+\.\S+$/.test(r.email),
    );

  const update = (i: number, patch: Partial<RecipientDraft>) =>
    setRecipients((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  const add = () => setRecipients((prev) => [...prev, { ...EMPTY }]);
  const remove = (i: number) =>
    setRecipients((prev) =>
      prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i),
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await promoters.assign(
        companyId,
        eventId,
        recipients.map((r) => ({
          fullName: r.fullName.trim(),
          email: r.email.trim().toLowerCase(),
          note: r.note?.trim() ? r.note.trim() : undefined,
        })),
      );
      setResult({
        assigned: res.assigned.length,
        created: res.createdAccounts,
        reused: res.reusedAccounts,
        alreadyAssigned: res.alreadyAssigned,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
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
              ◆ {t('organizer.events.promoters.eyebrow')}
            </div>
            <h2
              style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 36,
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              {t('organizer.events.promotersModal.title')}
            </h2>
            <p
              style={{
                color: '#908b83',
                fontSize: 13,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {t('organizer.events.promotersModal.description')}
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
          <form onSubmit={submit}>
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
              {t('organizer.events.promotersModal.recipients', {
                count: recipients.length,
              })}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {recipients.map((r, i) => {
                const emailNorm = r.email.trim().toLowerCase();
                const warn = emailNorm !== '' && alreadyEmails.has(emailNorm);
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
                        label={t('organizer.events.promotersModal.fields.fullName')}
                        value={r.fullName}
                        onChange={(v) => update(i, { fullName: v })}
                        placeholder="Camila Méndez"
                      />
                      <TextField
                        label={t('organizer.events.promotersModal.fields.email')}
                        value={r.email}
                        type="email"
                        onChange={(v) => update(i, { email: v })}
                        placeholder="camila@email.com"
                      />
                      <div style={{ gridColumn: '1 / -1' }}>
                        <TextField
                          label={t('organizer.events.promotersModal.fields.note')}
                          value={r.note ?? ''}
                          onChange={(v) => update(i, { note: v })}
                          placeholder={t(
                            'organizer.events.promotersModal.fields.notePlaceholder',
                          )}
                        />
                      </div>
                    </div>
                    {warn && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          color: '#ffb454',
                          fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.05em',
                        }}
                      >
                        ⚠ {t('organizer.events.promotersModal.alreadyAssigned')}
                      </div>
                    )}
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label={t('common.remove')}
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'transparent',
                          color: '#908b83',
                          border: 'none',
                          fontSize: 16,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 14,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={add}
                style={{
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
                }}
              >
                + {t('organizer.events.promotersModal.addAnother')}
              </button>
            </div>

            {duplicateInForm && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: '#ff4d5a',
                }}
              >
                {t('organizer.events.promotersModal.duplicateForm')}
              </div>
            )}
            {error && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: '#ff4d5a',
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  color: '#908b83',
                  border: '1px solid #34312c',
                  padding: '10px 18px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
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
                  background: canSubmit ? '#d7ff3a' : '#4a4741',
                  color: '#0a0908',
                  border: 'none',
                  padding: '10px 18px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderRadius: 4,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                }}
              >
                {submitting
                  ? t('common.loading')
                  : t('organizer.events.promotersModal.submit')}
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
  <label
    style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}
  >
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
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: '#1a1917',
        border: '1px solid #34312c',
        borderRadius: 4,
        color: '#faf7f0',
        padding: '10px 12px',
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
        fontSize: 13,
        outline: 'none',
      }}
    />
  </label>
);

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
          background: 'rgba(94, 234, 199, 0.06)',
          border: '1px solid rgba(94, 234, 199, 0.4)',
          borderRadius: 8,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 28,
            color: '#5eeac7',
            letterSpacing: '0.02em',
          }}
        >
          {t('organizer.events.promotersModal.result.title', {
            count: result.assigned,
          })}
        </div>
      </div>
      <ResultBlock
        label={t('organizer.events.promotersModal.result.created')}
        emails={result.created}
        color="#d7ff3a"
      />
      <ResultBlock
        label={t('organizer.events.promotersModal.result.reused')}
        emails={result.reused}
        color="#908b83"
      />
      <ResultBlock
        label={t('organizer.events.promotersModal.result.alreadyAssigned')}
        emails={result.alreadyAssigned}
        color="#ffb454"
      />
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#d7ff3a',
            color: '#0a0908',
            border: 'none',
            padding: '10px 18px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
};

const ResultBlock: React.FC<{
  label: string;
  emails: string[];
  color: string;
}> = ({ label, emails, color }) => {
  if (emails.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color,
          marginBottom: 6,
        }}
      >
        {label} ({emails.length})
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#908b83',
          lineHeight: 1.6,
        }}
      >
        {emails.join(', ')}
      </div>
    </div>
  );
};

export default AssignPromotersModal;

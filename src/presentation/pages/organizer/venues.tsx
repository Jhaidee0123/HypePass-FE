import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { PulseButton, SeoHelmet } from '@/presentation/components';
import { OrganizerVenues } from '@/domain/usecases';
import { VenueModel } from '@/domain/models';

type Props = {
  venues: OrganizerVenues;
};

type FormState = {
  name: string;
  addressLine: string;
  city: string;
  region: string;
  country: string;
  capacity: string;
  description: string;
};

const emptyForm: FormState = {
  name: '',
  addressLine: '',
  city: '',
  region: '',
  country: 'CO',
  capacity: '',
  description: '',
};

const OrganizerVenuesPage: React.FC<Props> = ({ venues }) => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const [items, setItems] = useState<VenueModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    try {
      setError(null);
      setItems(await venues.list(companyId));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  }, [companyId, venues, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const canSubmit =
    !submitting &&
    form.name.trim() !== '' &&
    form.addressLine.trim() !== '' &&
    form.city.trim() !== '' &&
    form.country.trim().length === 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !companyId) return;
    setSubmitting(true);
    setError(null);
    try {
      await venues.create(companyId, {
        name: form.name.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        region: form.region.trim() || undefined,
        country: form.country.trim().toUpperCase(),
        capacity: form.capacity ? Number(form.capacity) : undefined,
        description: form.description.trim() || undefined,
      });
      setForm(emptyForm);
      setCreating(false);
      await load();
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

  const handleDelete = async (venueId: string) => {
    if (!companyId) return;
    if (!window.confirm(t('organizer.venues.deleteConfirm'))) return;
    try {
      await venues.delete(companyId, venueId);
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    }
  };

  return (
    <div className={Styles.page}>
      <SeoHelmet
        title={`HypePass — ${t('organizer.venues.title')}`}
        description={t('organizer.venues.subtitle')}
      />

      <header className={Styles.header}>
        <div className={Styles.eyebrow}>◆ ORGANIZER</div>
        <h1 className={Styles.title}>{t('organizer.venues.title')}</h1>
        <p style={{ color: '#908b83', marginTop: 8, fontSize: 14 }}>
          <Link
            to="/organizer"
            style={{
              color: '#bfbab1',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            ← {t('common.back')}
          </Link>
        </p>
      </header>

      {error && <div className={Styles.error}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <PulseButton
          type="button"
          variant="primary"
          onClick={() => setCreating((v) => !v)}
        >
          {creating
            ? t('common.cancel')
            : t('organizer.venues.newVenue')}
        </PulseButton>
      </div>

      {creating && (
        <div className={Styles.card}>
          <form onSubmit={handleSubmit}>
            <Field
              label={t('organizer.venues.fields.name')}
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
            />
            <Field
              label={t('organizer.venues.fields.addressLine')}
              value={form.addressLine}
              onChange={(v) => setForm((f) => ({ ...f, addressLine: v }))}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
              <Field
                label={t('organizer.venues.fields.city')}
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                required
              />
              <Field
                label={t('organizer.venues.fields.region')}
                value={form.region}
                onChange={(v) => setForm((f) => ({ ...f, region: v }))}
              />
              <Field
                label={t('organizer.venues.fields.country')}
                value={form.country}
                onChange={(v) =>
                  setForm((f) => ({ ...f, country: v.toUpperCase() }))
                }
                required
              />
            </div>
            <Field
              label={t('organizer.venues.fields.capacity')}
              value={form.capacity}
              onChange={(v) =>
                setForm((f) => ({ ...f, capacity: v.replace(/[^0-9]/g, '') }))
              }
              type="number"
            />
            <Field
              label={t('organizer.venues.fields.description')}
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            />
            <div style={{ marginTop: 20 }}>
              <PulseButton
                type="submit"
                variant="primary"
                disabled={!canSubmit}
              >
                {submitting ? t('common.loading') : t('organizer.venues.submit')}
              </PulseButton>
            </div>
          </form>
        </div>
      )}

      {items === null ? (
        <div className={Styles.card}>{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className={Styles.card}>{t('organizer.venues.empty')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((v) => (
            <div key={v.id} className={Styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 18, color: '#faf7f0', marginBottom: 4 }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#908b83' }}>
                    {v.addressLine} · {v.city}
                    {v.region ? `, ${v.region}` : ''} · {v.country}
                    {v.capacity ? ` · cap ${v.capacity}` : ''}
                  </div>
                  {v.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6b6760',
                        marginTop: 6,
                        fontStyle: 'italic',
                      }}
                    >
                      {v.description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ff4d5a',
                    color: '#ff4d5a',
                    padding: '6px 12px',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: 4,
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {t('organizer.venues.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  required,
}) => (
  <div style={{ marginBottom: 14 }}>
    <div
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: '#6b6760',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}
    >
      {label} {required && <span style={{ color: '#ff4d5a' }}>*</span>}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: '#121110',
        border: '1px solid #242320',
        color: '#faf7f0',
        borderRadius: 4,
        fontSize: 14,
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
        outline: 'none',
      }}
    />
  </div>
);

export default OrganizerVenuesPage;

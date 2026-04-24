import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from '../organizer-styles.scss';
import { PulseButton } from '@/presentation/components';
import { OrganizerCompanies } from '@/domain/usecases';
import { CompanyModel } from '@/domain/models';
import { Validation } from '@/presentation/protocols/validation';

type Props = {
  companies: OrganizerCompanies;
  validation: Validation;
  onCreated: (company: CompanyModel) => void;
  onCancel: () => void;
};

type FieldKey = 'name' | 'slug' | 'legalName' | 'taxId' | 'contactEmail';

export const CreateCompanyForm: React.FC<Props> = ({
  companies,
  validation,
  onCreated,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: '',
    slug: '',
    legalName: '',
    taxId: '',
    contactEmail: '',
  });
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    name: false,
    slug: false,
    legalName: false,
    taxId: false,
    contactEmail: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errors = useMemo(
    () => ({
      name: validation.validate('name', values),
      slug: validation.validate('slug', values),
      contactEmail: validation.validate('contactEmail', values),
    }),
    [values, validation],
  );

  const formInvalid = !!errors.name || !!errors.slug || !!errors.contactEmail;
  const canSubmit = !formInvalid && !submitting;

  useEffect(() => {
    // Touch all fields on submit attempt (see handleSubmit); no-op here.
  }, []);

  const setField = (key: FieldKey, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const touch = (key: FieldKey) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      slug: true,
      legalName: true,
      taxId: true,
      contactEmail: true,
    });
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await companies.create({
        name: values.name.trim(),
        slug: values.slug.trim(),
        legalName: values.legalName.trim() || undefined,
        taxId: values.taxId.trim() || undefined,
        contactEmail: values.contactEmail.trim() || undefined,
      });
      onCreated(created);
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

  return (
    <form onSubmit={handleSubmit} className="create-company-form">
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          color: '#6b6760',
          marginBottom: 12,
        }}
      >
        ◆ {t('organizer.company.title').toUpperCase()}
      </div>

      <Field
        label={t('organizer.company.name')}
        value={values.name}
        onChange={(v) => setField('name', v)}
        onBlur={() => touch('name')}
        placeholder="Stage Live Producciones"
        required
        error={touched.name ? errors.name : null}
      />
      <Field
        label={t('organizer.company.slug')}
        value={values.slug}
        onChange={(v) => setField('slug', v.toLowerCase())}
        onBlur={() => touch('slug')}
        placeholder="stage-live"
        hint={t('organizer.company.slugHint')}
        required
        error={touched.slug ? errors.slug : null}
      />
      <Field
        label={t('organizer.company.legalName')}
        value={values.legalName}
        onChange={(v) => setField('legalName', v)}
        placeholder="Stage Live S.A.S."
      />
      <Field
        label={t('organizer.company.taxId')}
        value={values.taxId}
        onChange={(v) => setField('taxId', v)}
        placeholder="900.123.456-7"
      />
      <Field
        label={t('organizer.company.contactEmail')}
        value={values.contactEmail}
        onChange={(v) => setField('contactEmail', v)}
        onBlur={() => touch('contactEmail')}
        placeholder="contacto@stage.live"
        type="email"
        error={touched.contactEmail ? errors.contactEmail : null}
      />

      {error && <p className={Styles.error}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <PulseButton type="submit" variant="primary" disabled={!canSubmit}>
          {submitting ? t('common.loading') : t('organizer.company.submit')}
        </PulseButton>
        <PulseButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          {t('common.cancel')}
        </PulseButton>
      </div>

      <p
        style={{
          fontSize: 12,
          color: '#908b83',
          marginTop: 16,
          lineHeight: 1.6,
        }}
      >
        {t('organizer.company.note')}
      </p>
    </form>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  error?: string | null;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  required,
  type = 'text',
  error,
}) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: '#6b6760',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      {label} {required && <span style={{ color: '#ff4d5a' }}>*</span>}
    </div>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{
        width: '100%',
        padding: '12px 14px',
        fontSize: 14,
        background: '#121110',
        border: `1px solid ${error ? '#ff4d5a' : '#242320'}`,
        color: '#faf7f0',
        borderRadius: 4,
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
        outline: 'none',
      }}
    />
    {error && (
      <div style={{ fontSize: 11, color: '#ff4d5a', marginTop: 6 }}>
        {error}
      </div>
    )}
    {!error && hint && (
      <div style={{ fontSize: 11, color: '#6b6760', marginTop: 6 }}>
        {hint}
      </div>
    )}
  </div>
);

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Styles from './organizer-styles.scss';
import { PulseButton } from '@/presentation/components';
import {
  OrganizerCategories,
  OrganizerEvents,
  UploadImage,
} from '@/domain/usecases';
import { CategoryModel } from '@/domain/models';
import { ImageUpload } from './components/image-upload';
import {
  BANNER_IMAGE_SPEC,
  COVER_IMAGE_SPEC,
} from './components/image-specs';
import { BasicField } from './components/basic-field';
import { ToggleField } from './components/toggle-field';
import LocationPicker, { LocationValue } from './components/location-picker';

type Props = {
  events: OrganizerEvents;
  categories: OrganizerCategories;
  uploader: UploadImage;
};

const EMPTY_LOCATION: LocationValue = {
  name: null,
  address: null,
  latitude: null,
  longitude: null,
};

const EventCreate: React.FC<Props> = ({ events, categories, uploader }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');
  const [resaleEnabled, setResaleEnabled] = useState<boolean>(true);

  const [cats, setCats] = useState<CategoryModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categories.list().then(setCats).catch(() => undefined);
  }, [categories]);

  // auto-slug from title
  useEffect(() => {
    if (slug === '' || slug === makeSlug(title.slice(0, title.length - 1))) {
      setSlug(makeSlug(title));
    }
  }, [title]);

  const slugValid = slug === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const canSubmit =
    !!companyId &&
    title.trim() !== '' &&
    slug.trim() !== '' &&
    slugValid &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !companyId) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await events.create(companyId, {
        title,
        slug,
        shortDescription: shortDescription || undefined,
        description: description || undefined,
        categoryId: categoryId || undefined,
        coverImageUrl: coverImageUrl || undefined,
        bannerImageUrl: bannerImageUrl || undefined,
        resaleEnabled,
        locationName: location.name,
        locationAddress: location.address,
        locationLatitude: location.latitude,
        locationLongitude: location.longitude,
      });
      navigate(`/organizer/companies/${companyId}/events/${created.id}`);
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
    <div className={Styles.page}>
      <Helmet>
        <title>HypePass — {t('organizer.events.new')}</title>
      </Helmet>

      <div style={{ marginBottom: 24 }}>
        <Link
          to="/organizer"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
            color: '#6b6760',
          }}
        >
          ← {t('common.back')}
        </Link>
      </div>

      <h1 className={Styles.title} style={{ marginBottom: 28 }}>
        {t('organizer.events.newTitle')}
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
        <BasicField
          label={t('organizer.events.fields.title')}
          value={title}
          onChange={setTitle}
          placeholder="PARALLAX — Festival 3 días"
          required
        />
        <BasicField
          label={t('organizer.events.fields.slug')}
          value={slug}
          onChange={(v) => setSlug(v.toLowerCase())}
          placeholder="parallax-festival-2026"
          hint={t('organizer.events.fields.slugHint')}
          required
        />
        <BasicField
          label={t('organizer.events.fields.shortDescription')}
          value={shortDescription}
          onChange={setShortDescription}
          placeholder="3 días, 2 escenarios, 34 artistas."
        />
        <BasicField
          label={t('organizer.events.fields.description')}
          value={description}
          onChange={setDescription}
          placeholder="Descripción larga del evento..."
          textarea
          rows={6}
        />

        <SelectField
          label={t('organizer.events.fields.category')}
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { value: '', label: '—' },
            ...cats.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: '#6b6760',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {t('organizer.events.fields.location')}
          </div>
          <LocationPicker
            value={location}
            onChange={setLocation}
            countryCode="co"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <ImageUpload
            uploader={uploader}
            value={coverImageUrl}
            onChange={(url) => setCoverImageUrl(url)}
            label={t('organizer.events.fields.cover')}
            aspect={COVER_IMAGE_SPEC.aspect}
            minWidth={COVER_IMAGE_SPEC.minWidth}
            minHeight={COVER_IMAGE_SPEC.minHeight}
            targetRatio={COVER_IMAGE_SPEC.targetRatio}
          />
          <ImageUpload
            uploader={uploader}
            value={bannerImageUrl}
            onChange={(url) => setBannerImageUrl(url)}
            label={t('organizer.events.fields.banner')}
            aspect={BANNER_IMAGE_SPEC.aspect}
            minWidth={BANNER_IMAGE_SPEC.minWidth}
            minHeight={BANNER_IMAGE_SPEC.minHeight}
            targetRatio={BANNER_IMAGE_SPEC.targetRatio}
          />
        </div>

        <ToggleField
          label={t('organizer.events.fields.resaleEnabled')}
          hint={t('organizer.events.fields.resaleEnabledHint')}
          value={resaleEnabled}
          onChange={setResaleEnabled}
        />

        {error && <p className={Styles.error}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <PulseButton type="submit" variant="primary" disabled={!canSubmit}>
            {submitting ? t('common.loading') : t('organizer.events.create')}
          </PulseButton>
          <PulseButton
            type="button"
            variant="secondary"
            onClick={() => navigate('/organizer')}
          >
            {t('common.cancel')}
          </PulseButton>
        </div>
      </form>
    </div>
  );
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div style={{ marginBottom: 14 }}>
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
      {label}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '12px 14px',
        fontSize: 14,
        background: '#121110',
        border: '1px solid #242320',
        color: '#faf7f0',
        borderRadius: 4,
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
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

function makeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default EventCreate;

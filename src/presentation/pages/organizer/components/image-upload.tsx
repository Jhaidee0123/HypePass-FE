import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadImage } from '@/domain/usecases';

type Props = {
  uploader: UploadImage;
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  label: string;
  aspect?: string;
};

export const ImageUpload: React.FC<Props> = ({
  uploader,
  value,
  onChange,
  label,
  aspect = '16 / 9',
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const res = await uploader.upload(file);
      onChange(res.url, res.publicId);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          t('errors.unexpected'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
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
        {label}
      </div>

      <div
        style={{
          position: 'relative',
          aspectRatio: aspect,
          borderRadius: 6,
          border: '1px dashed #34312c',
          background: '#0a0908',
          overflow: 'hidden',
          cursor: busy ? 'progress' : 'pointer',
        }}
        onClick={() => !busy && inputRef.current?.click()}
      >
        {value ? (
          <img
            src={value}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              color: '#6b6760',
            }}
          >
            {busy
              ? t('common.loading').toUpperCase()
              : `+ ${t('organizer.events.uploadImage').toUpperCase()}`}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {error && (
        <div
          style={{
            fontSize: 12,
            color: '#ff4d5a',
            marginTop: 8,
          }}
        >
          {error}
        </div>
      )}

      {value && !busy && (
        <button
          type="button"
          onClick={() => onChange('', '')}
          style={{
            marginTop: 8,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#6b6760',
          }}
        >
          {t('common.close').toUpperCase()}
        </button>
      )}
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadImage } from '@/domain/usecases';

type Props = {
  uploader: UploadImage;
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  label: string;
  /** CSS aspect-ratio for the dropzone preview (e.g. '16 / 9'). */
  aspect?: string;
  /**
   * If provided, the picked file must be at least this wide (pixels).
   * Smaller files are rejected with a friendly error and never reach the
   * upload service.
   */
  minWidth?: number;
  /** Same as minWidth, for height. */
  minHeight?: number;
  /**
   * Target aspect ratio (width / height). When set, the picked file's
   * ratio must be within `ratioTolerance` of this value. Defaults to none.
   */
  targetRatio?: number;
  /** Allowed deviation around `targetRatio` (default 0.04 = ±4%). */
  ratioTolerance?: number;
  /** Max file size in bytes (default 8 MB). */
  maxBytes?: number;
};

type Dimensions = { width: number; height: number };

const readDimensions = (file: File): Promise<Dimensions> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image_decode_failed'));
    };
    img.src = url;
  });

export const ImageUpload: React.FC<Props> = ({
  uploader,
  value,
  onChange,
  label,
  aspect = '16 / 9',
  minWidth,
  minHeight,
  targetRatio,
  ratioTolerance = 0.04,
  maxBytes = 8 * 1024 * 1024,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type ValidationResult =
    | { ok: true; reason?: undefined }
    | { ok: false; reason: string };
  const validateFile = async (file: File): Promise<ValidationResult> => {
    if (file.size > maxBytes) {
      return {
        ok: false,
        reason: t('organizer.events.image.errors.tooLarge', {
          max: Math.round(maxBytes / (1024 * 1024)),
        }),
      };
    }
    let dims: Dimensions;
    try {
      dims = await readDimensions(file);
    } catch {
      return {
        ok: false,
        reason: t('organizer.events.image.errors.decode'),
      };
    }
    if (minWidth && dims.width < minWidth) {
      return {
        ok: false,
        reason: t('organizer.events.image.errors.minWidth', {
          min: minWidth,
          got: dims.width,
        }),
      };
    }
    if (minHeight && dims.height < minHeight) {
      return {
        ok: false,
        reason: t('organizer.events.image.errors.minHeight', {
          min: minHeight,
          got: dims.height,
        }),
      };
    }
    if (targetRatio) {
      const got = dims.width / dims.height;
      if (Math.abs(got - targetRatio) / targetRatio > ratioTolerance) {
        return {
          ok: false,
          reason: t('organizer.events.image.errors.ratio', {
            expected: targetRatio.toFixed(2),
            got: got.toFixed(2),
          }),
        };
      }
    }
    return { ok: true };
  };

  const handleFile = async (file: File) => {
    setError(null);
    const validation = await validateFile(file);
    if (!validation.ok) {
      setError(validation.reason);
      return;
    }
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

  const requirementText = (() => {
    if (!minWidth && !minHeight && !targetRatio) return null;
    const parts: string[] = [];
    if (minWidth && minHeight) {
      parts.push(`${minWidth}×${minHeight}px`);
    } else if (minWidth) {
      parts.push(`≥${minWidth}px ${t('organizer.events.image.wide')}`);
    } else if (minHeight) {
      parts.push(`≥${minHeight}px ${t('organizer.events.image.tall')}`);
    }
    if (targetRatio) {
      const ratioLabel =
        Math.abs(targetRatio - 16 / 9) < 0.05
          ? '16:9'
          : Math.abs(targetRatio - 4 / 5) < 0.05
            ? '4:5'
            : Math.abs(targetRatio - 1) < 0.05
              ? '1:1'
              : targetRatio.toFixed(2);
      parts.push(`${ratioLabel}`);
    }
    return parts.join(' · ');
  })();

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: '#6b6760',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {requirementText && (
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.06em',
            color: '#908b83',
            marginBottom: 8,
          }}
        >
          ◆ {requirementText}
        </div>
      )}

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

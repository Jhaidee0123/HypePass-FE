import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoogleMaps } from '@/presentation/hooks';

export type LocationValue = {
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  /** ISO-2 country code to bias the search ("co", "us"...). */
  countryCode?: string;
};

const DEFAULT_CENTER = { lat: 4.6097, lng: -74.0817 }; // Bogotá

/**
 * Google Places-powered location picker. Uses the Maps JS SDK Autocomplete
 * for search and renders a small, draggable-marker map preview so the
 * organizer can fine-tune the pin position. Falls back to manual coord
 * inputs when the API key is missing.
 */
const LocationPicker: React.FC<Props> = ({ value, onChange, countryCode }) => {
  const { t } = useTranslation();
  const { ready, error, enabled } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  // Wire up Autocomplete once the SDK is ready and the input is mounted.
  useEffect(() => {
    if (!ready || !enabled || !inputRef.current) return;
    const google = (window as any).google;
    if (!google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['name', 'formatted_address', 'geometry'],
      types: ['establishment', 'geocode'],
      componentRestrictions: countryCode
        ? { country: countryCode.toLowerCase() }
        : undefined,
    });
    autocompleteRef.current = autocomplete;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const loc = place?.geometry?.location;
      const lat = typeof loc?.lat === 'function' ? loc.lat() : null;
      const lng = typeof loc?.lng === 'function' ? loc.lng() : null;
      onChange({
        name: place?.name ?? null,
        address: place?.formatted_address ?? null,
        latitude: typeof lat === 'number' ? lat : null,
        longitude: typeof lng === 'number' ? lng : null,
      });
    });

    return () => {
      try {
        google.maps.event.removeListener(listener);
        google.maps.event.clearInstanceListeners(autocomplete);
      } catch {
        /* noop */
      }
    };
  }, [ready, enabled, countryCode, onChange]);

  // Build the map + marker (only when we have coords).
  useEffect(() => {
    if (!ready || !enabled || !mapDivRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    const lat = value.latitude;
    const lng = value.longitude;
    const center =
      lat !== null && lng !== null
        ? { lat, lng }
        : DEFAULT_CENTER;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapDivRef.current, {
        center,
        zoom: lat !== null ? 16 : 12,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        clickableIcons: false,
        gestureHandling: 'cooperative',
      });
    } else {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(lat !== null ? 16 : 12);
    }

    if (lat !== null && lng !== null) {
      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          map: mapRef.current,
          position: { lat, lng },
          draggable: true,
        });
        markerRef.current.addListener('dragend', () => {
          const pos = markerRef.current.getPosition();
          if (!pos) return;
          onChange({
            ...valueRef.current,
            latitude: pos.lat(),
            longitude: pos.lng(),
          });
        });
      } else {
        markerRef.current.setPosition({ lat, lng });
        markerRef.current.setMap(mapRef.current);
      }
    } else if (markerRef.current) {
      markerRef.current.setMap(null);
    }
  }, [ready, enabled, value.latitude, value.longitude, onChange]);

  const updateField = (patch: Partial<LocationValue>) => {
    onChange({ ...value, ...patch });
  };

  const hasCoords =
    value.latitude !== null &&
    value.longitude !== null &&
    !Number.isNaN(value.latitude) &&
    !Number.isNaN(value.longitude);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Label>{t('organizer.events.location.search')}</Label>
        {enabled ? (
          <>
            <input
              ref={inputRef}
              type="text"
              defaultValue={value.address ?? value.name ?? ''}
              placeholder={t('organizer.events.location.searchPlaceholder')}
              style={inputStyle}
              autoComplete="off"
            />
            {!ready && !error && (
              <div style={hintStyle}>
                {t('organizer.events.location.loadingMaps')}
              </div>
            )}
            {error && (
              <div style={{ ...hintStyle, color: '#ff4d5a' }}>
                {t('organizer.events.location.searchError')}
              </div>
            )}
          </>
        ) : (
          <div style={{ ...hintStyle, color: '#ffb454' }}>
            {t('organizer.events.location.disabledHint')}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <div>
          <Label>{t('organizer.events.location.name')}</Label>
          <input
            type="text"
            value={value.name ?? ''}
            onChange={(e) => updateField({ name: e.target.value || null })}
            placeholder="Movistar Arena, Salón principal..."
            style={inputStyle}
          />
        </div>
        <div>
          <Label>{t('organizer.events.location.address')}</Label>
          <input
            type="text"
            value={value.address ?? ''}
            onChange={(e) => updateField({ address: e.target.value || null })}
            placeholder="Cl. 100 #20-30, Bogotá"
            style={inputStyle}
          />
        </div>
        <div>
          <Label>{t('organizer.events.location.latitude')}</Label>
          <input
            type="number"
            step="0.0000001"
            value={value.latitude ?? ''}
            onChange={(e) => {
              const n = e.target.value === '' ? null : Number(e.target.value);
              updateField({ latitude: Number.isFinite(n as number) ? n : null });
            }}
            placeholder="4.6097"
            style={inputStyle}
          />
        </div>
        <div>
          <Label>{t('organizer.events.location.longitude')}</Label>
          <input
            type="number"
            step="0.0000001"
            value={value.longitude ?? ''}
            onChange={(e) => {
              const n = e.target.value === '' ? null : Number(e.target.value);
              updateField({ longitude: Number.isFinite(n as number) ? n : null });
            }}
            placeholder="-74.0817"
            style={inputStyle}
          />
        </div>
      </div>

      {enabled && (
        <div
          style={{
            border: '1px solid #34312c',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            ref={mapDivRef}
            style={{
              width: '100%',
              height: 280,
              background: '#1a1917',
            }}
          />
          {hasCoords && (
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: '#908b83',
                padding: '8px 12px',
                background: '#0a0908',
                borderTop: '1px solid #34312c',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span>
                {value.latitude?.toFixed(6)}, {value.longitude?.toFixed(6)} ·{' '}
                {t('organizer.events.location.dragHint')}
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${value.latitude},${value.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#d7ff3a', textDecoration: 'none' }}
              >
                {t('organizer.events.location.openExternal')} ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      letterSpacing: '0.12em',
      color: '#908b83',
      textTransform: 'uppercase',
      marginBottom: 4,
    }}
  >
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1917',
  border: '1px solid #34312c',
  borderRadius: 4,
  color: '#faf7f0',
  padding: '10px 12px',
  fontFamily: 'Space Grotesk, system-ui, sans-serif',
  fontSize: 13,
  outline: 'none',
};

const hintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 11,
  color: '#908b83',
  fontFamily: 'JetBrains Mono, monospace',
  letterSpacing: '0.04em',
};

export default LocationPicker;

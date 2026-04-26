import { useEffect, useState } from 'react';
import appConfig from '@/main/config/app-config';

type GoogleMapsState = {
  ready: boolean;
  error: string | null;
  /** True only when the API key is present in app-config. */
  enabled: boolean;
};

const SCRIPT_ID = 'google-maps-js-sdk';

let pendingPromise: Promise<void> | null = null;

const loadOnce = (apiKey: string): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window unavailable'));
  }
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (pendingPromise) return pendingPromise;

  pendingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Maps script failed')));
      return;
    }
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.async = true;
    s.defer = true;
    // `places` lib gives us Autocomplete + PlacesService.
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places&language=es&region=co&v=weekly`;
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('Maps script failed')));
    document.head.appendChild(s);
  });
  return pendingPromise;
};

/**
 * Lazily injects the Google Maps JS SDK and reports readiness. Designed for
 * the LocationPicker — components mount this hook and only render the
 * autocomplete/map once `ready` flips to true.
 *
 * Falls back gracefully when the key is missing (`enabled === false`) so dev
 * environments without a key keep working with manual coordinate inputs.
 */
export const useGoogleMaps = (): GoogleMapsState => {
  const apiKey = appConfig.googleMapsApiKey;
  const enabled = !!apiKey;
  const [ready, setReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).google?.maps?.places;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || ready) return;
    let cancelled = false;
    loadOnce(apiKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? 'maps_load_failed');
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, enabled, ready]);

  return { ready, error, enabled };
};

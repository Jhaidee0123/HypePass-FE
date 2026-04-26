import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PageViewTracker } from '@/domain/usecases';

const SESSION_KEY = 'hypepass.analyticsSessionId';

const ensureSessionId = (): string => {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return Math.random().toString(36).slice(2);
  }
};

const inferDevice = (): string => {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/.test(ua)) return 'mobile';
  if (/Tablet/.test(ua)) return 'tablet';
  return 'desktop';
};

/**
 * Fires one page-view beacon every time the route changes. Designed to be
 * mounted exactly once at the shell level. Beacons are best-effort: they
 * never throw, even if the network is offline.
 */
export const usePageViewTracker = (tracker: PageViewTracker): void => {
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;
    void tracker.track({
      path,
      referrer: document.referrer || undefined,
      sessionId: ensureSessionId(),
      locale:
        typeof navigator !== 'undefined' && navigator.language
          ? navigator.language.slice(0, 8)
          : undefined,
      device: inferDevice(),
    });
  }, [location.pathname, location.search, tracker]);
};

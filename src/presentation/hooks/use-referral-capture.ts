import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const KEY_PREFIX = 'hypepass.referral.';
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type StoredRef = { code: string; capturedAt: number };

const safeWrite = (slug: string, code: string) => {
  try {
    const payload: StoredRef = { code, capturedAt: Date.now() };
    localStorage.setItem(`${KEY_PREFIX}${slug}`, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
};

export const readReferralForEvent = (slug: string): string | null => {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    if (!parsed?.code) return null;
    if (Date.now() - parsed.capturedAt > TTL_MS) {
      localStorage.removeItem(`${KEY_PREFIX}${slug}`);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
};

/**
 * Captures `?ref=CODE` from the URL on event-detail and persists it under
 * a per-slug key so it survives login/signup redirects until the buyer
 * lands on /checkout. The code is upper-cased and length-capped (20).
 *
 * Mount this once on the event-detail page with the current event slug.
 */
export const useReferralCapture = (slug: string | null | undefined): void => {
  const [params] = useSearchParams();
  useEffect(() => {
    if (!slug) return;
    const ref = params.get('ref');
    if (!ref) return;
    const normalized = ref.trim().toUpperCase().slice(0, 20);
    if (!normalized) return;
    safeWrite(slug, normalized);
  }, [slug, params]);
};

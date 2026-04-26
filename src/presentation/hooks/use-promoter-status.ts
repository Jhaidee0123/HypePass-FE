import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { currentAccountState } from '@/presentation/components/atoms/atoms';
import { makePromoterSelf } from '@/main/factories/usecases/promoter';

type Status = { hasPromotions: boolean; ready: boolean };

const STORAGE_KEY = 'hypepass.isPromoter';

const readCache = (userId: string): boolean | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId: string; value: boolean };
    if (parsed.userId !== userId) return null;
    return parsed.value;
  } catch {
    return null;
  }
};

const writeCache = (userId: string, value: boolean): void => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ userId, value }),
    );
  } catch {
    /* ignore quota */
  }
};

/**
 * Returns whether the current user is a promoter of at least one event.
 * Hits `GET /me/promoter/events` once per session and caches the result in
 * sessionStorage. The Nav uses this to decide whether to show the
 * "Promotor" link.
 *
 * `ready` is false until we have an answer; we render conservatively
 * (no link) while undecided.
 */
export const usePromoterStatus = (): Status => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const userId = account?.user?.id;

  const cached = userId ? readCache(userId) : null;
  const [hasPromotions, setHasPromotions] = useState<boolean>(cached ?? false);
  const [ready, setReady] = useState<boolean>(cached !== null);

  useEffect(() => {
    if (!userId) {
      setHasPromotions(false);
      setReady(true);
      return;
    }
    const cachedNow = readCache(userId);
    if (cachedNow !== null) {
      setHasPromotions(cachedNow);
      setReady(true);
      return;
    }
    let cancelled = false;
    const promoter = makePromoterSelf();
    promoter
      .listEvents()
      .then((events) => {
        if (cancelled) return;
        const has = events.length > 0;
        setHasPromotions(has);
        writeCache(userId, has);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Treat 401/network errors as "not a promoter" — the link is
        // always recoverable via the email or by typing /promoter.
        setHasPromotions(false);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { hasPromotions, ready };
};

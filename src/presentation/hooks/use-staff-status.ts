import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { currentAccountState } from '@/presentation/components/atoms/atoms';
import { makeStaffSelf } from '@/main/factories/usecases/staff';

type Status = { isStaff: boolean; ready: boolean };

const STORAGE_KEY = 'hypepass.isStaff';

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
 * Returns whether the current user is event-staff of at least one active
 * event. Hits `GET /me/staff/events` once per session and caches the result
 * in sessionStorage. The Nav uses this to decide whether to show the
 * "Check-in" link.
 *
 * `ready` is false until we have an answer; we render conservatively
 * (no link) while undecided. On 401/network errors we treat as "not staff"
 * — the email CTA still works.
 */
export const useStaffStatus = (): Status => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const userId = account?.user?.id;

  const cached = userId ? readCache(userId) : null;
  const [isStaff, setIsStaff] = useState<boolean>(cached ?? false);
  const [ready, setReady] = useState<boolean>(cached !== null);

  useEffect(() => {
    if (!userId) {
      setIsStaff(false);
      setReady(true);
      return;
    }
    const cachedNow = readCache(userId);
    if (cachedNow !== null) {
      setIsStaff(cachedNow);
      setReady(true);
      return;
    }
    let cancelled = false;
    const staff = makeStaffSelf();
    staff
      .listEvents()
      .then((events) => {
        if (cancelled) return;
        const has = events.length > 0;
        setIsStaff(has);
        writeCache(userId, has);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsStaff(false);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isStaff, ready };
};

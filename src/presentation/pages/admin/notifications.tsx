import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './notifications-styles.scss';
import {
  AdminNotificationRow,
  AdminNotifications,
} from '@/domain/usecases';

type Props = {
  notifications: AdminNotifications;
};

const NotificationsPage: React.FC<Props> = ({ notifications }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<AdminNotificationRow[]>([]);
  const [unackCount, setUnackCount] = useState(0);
  const [unackOnly, setUnackOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (next = unackOnly) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notifications.list(next);
      setItems(res.items);
      setUnackCount(res.unackCount);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(unackOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unackOnly]);

  const handleAck = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await notifications.ack(id);
      setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnackCount((c) => Math.max(0, c - 1));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleAckAll = async () => {
    setBusyId('all');
    try {
      await notifications.ackAll();
      await load(unackOnly);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={Styles.wrap}>
      <div className={Styles.toolbar}>
        <div className={Styles.summary}>
          <span className={Styles.badge}>{unackCount}</span>
          <span>{t('admin.inbox.unackCount')}</span>
        </div>
        <div className={Styles.actions}>
          <label className={Styles.toggle}>
            <input
              type="checkbox"
              checked={unackOnly}
              onChange={(e) => setUnackOnly(e.target.checked)}
            />
            <span>{t('admin.inbox.unackOnly')}</span>
          </label>
          <button
            type="button"
            className={Styles.primary}
            disabled={busyId === 'all' || unackCount === 0}
            onClick={handleAckAll}
          >
            {busyId === 'all' ? t('common.loading') : t('admin.inbox.ackAll')}
          </button>
        </div>
      </div>

      {error && <div className={Styles.error}>{error}</div>}
      {loading && items.length === 0 ? (
        <div className={Styles.loading}>{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className={Styles.empty}>{t('admin.inbox.empty')}</div>
      ) : (
        <ul className={Styles.list}>
          {items.map((n) => (
            <li
              key={n.id}
              className={`${Styles.row} ${Styles[`level_${n.level}`]} ${n.acknowledgedAt ? Styles.acked : ''}`}
            >
              <div className={Styles.head}>
                <span
                  className={`${Styles.levelPill} ${Styles[`pill_${n.level}`]}`}
                >
                  {n.level.toUpperCase()}
                </span>
                <span className={Styles.kind}>{n.kind}</span>
                <span className={Styles.time}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <div className={Styles.title}>{n.title}</div>
              {n.body && <p className={Styles.body}>{n.body}</p>}
              {n.metadata && (
                <pre className={Styles.metadata}>
                  {JSON.stringify(n.metadata, null, 2)}
                </pre>
              )}
              {!n.acknowledgedAt && (
                <button
                  type="button"
                  className={Styles.ackBtn}
                  disabled={busyId === n.id}
                  onClick={() => handleAck(n.id)}
                >
                  {busyId === n.id
                    ? t('common.loading')
                    : t('admin.inbox.ack')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;

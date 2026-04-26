import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Styles from './global-views-styles.scss';
import {
  AdminGlobalViews,
  CourtesyRow,
  StaffAssignmentRow,
} from '@/domain/usecases';

type Props = {
  globalViews: AdminGlobalViews;
};

type Mode = 'courtesies' | 'staff';

const GlobalViewsPage: React.FC<Props> = ({ globalViews }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('courtesies');
  const [courtesies, setCourtesies] = useState<CourtesyRow[] | null>(null);
  const [staff, setStaff] = useState<StaffAssignmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'courtesies') {
        const list = await globalViews.listCourtesies(200);
        setCourtesies(list);
      } else {
        const list = await globalViews.listStaff(300);
        setStaff(list);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t('errors.unexpected'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className={Styles.wrap}>
      <div className={Styles.modeRow}>
        <button
          type="button"
          className={`${Styles.modeBtn} ${mode === 'courtesies' ? Styles.modeBtnActive : ''}`}
          onClick={() => setMode('courtesies')}
        >
          {t('admin.global.mode.courtesies')}
        </button>
        <button
          type="button"
          className={`${Styles.modeBtn} ${mode === 'staff' ? Styles.modeBtnActive : ''}`}
          onClick={() => setMode('staff')}
        >
          {t('admin.global.mode.staff')}
        </button>
      </div>

      {error && <div className={Styles.error}>{error}</div>}
      {loading && <div className={Styles.loading}>{t('common.loading')}</div>}

      {mode === 'courtesies' && courtesies && courtesies.length > 0 && (
        <table className={Styles.table}>
          <thead>
            <tr>
              <th>{t('admin.global.cols.event')}</th>
              <th>{t('admin.global.cols.section')}</th>
              <th>{t('admin.global.cols.owner')}</th>
              <th align="right">{t('admin.global.cols.faceValue')}</th>
              <th>{t('admin.global.cols.status')}</th>
              <th>{t('admin.global.cols.created')}</th>
            </tr>
          </thead>
          <tbody>
            {courtesies.map((c) => (
              <tr key={c.ticketId}>
                <td>
                  <Link to={`/admin/events/${c.eventId}`}>{c.eventTitle}</Link>
                  <div className={Styles.sub}>/{c.eventSlug}</div>
                </td>
                <td>{c.sectionName ?? '—'}</td>
                <td>
                  {c.ownerName ?? '—'}
                  <div className={Styles.sub}>
                    {c.ownerEmail ?? c.ownerUserId.slice(0, 8)}
                  </div>
                </td>
                <td align="right">
                  {c.currency} {(c.faceValue / 100).toLocaleString('es-CO')}
                </td>
                <td>{c.status}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mode === 'courtesies' && courtesies && courtesies.length === 0 && (
        <div className={Styles.empty}>{t('admin.global.empty')}</div>
      )}

      {mode === 'staff' && staff && staff.length > 0 && (
        <table className={Styles.table}>
          <thead>
            <tr>
              <th>{t('admin.global.cols.event')}</th>
              <th>{t('admin.global.cols.role')}</th>
              <th>{t('admin.global.cols.user')}</th>
              <th>{t('admin.global.cols.note')}</th>
              <th>{t('admin.global.cols.assignedBy')}</th>
              <th>{t('admin.global.cols.created')}</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link to={`/admin/events/${s.eventId}`}>{s.eventTitle}</Link>
                  <div className={Styles.sub}>/{s.eventSlug}</div>
                </td>
                <td>
                  <span className={Styles.pill}>{s.role}</span>
                </td>
                <td>
                  {s.userName ?? '—'}
                  <div className={Styles.sub}>
                    {s.userEmail ?? s.userId.slice(0, 8)}
                  </div>
                </td>
                <td>{s.note ?? '—'}</td>
                <td className={Styles.sub}>
                  {s.assignedByUserId.slice(0, 8)}
                </td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mode === 'staff' && staff && staff.length === 0 && (
        <div className={Styles.empty}>{t('admin.global.empty')}</div>
      )}
    </div>
  );
};

export default GlobalViewsPage;

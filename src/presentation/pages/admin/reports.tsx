import React from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './reports-styles.scss';
import appConfig from '@/main/config/app-config';

const triggerDownload = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.target = '_self';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const base = appConfig.api.ENDPOINT;

  const reports = [
    {
      key: 'orders',
      title: t('admin.reports.orders.title'),
      body: t('admin.reports.orders.body'),
      url: `${base}/admin/exports/orders.csv`,
    },
    {
      key: 'payouts',
      title: t('admin.reports.payouts.title'),
      body: t('admin.reports.payouts.body'),
      url: `${base}/admin/exports/payouts.csv`,
    },
    {
      key: 'users',
      title: t('admin.reports.users.title'),
      body: t('admin.reports.users.body'),
      url: `${base}/admin/exports/users.csv`,
    },
  ];

  return (
    <div className={Styles.wrap}>
      <p className={Styles.note}>{t('admin.reports.note')}</p>
      <div className={Styles.grid}>
        {reports.map((r) => (
          <div key={r.key} className={Styles.card}>
            <div className={Styles.title}>{r.title}</div>
            <p className={Styles.body}>{r.body}</p>
            <button
              type="button"
              className={Styles.download}
              onClick={() => triggerDownload(r.url)}
            >
              {t('admin.reports.download')} ↓
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;

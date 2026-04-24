/**
 * Dashboard Page (Protected)
 *
 * Example page only accessible to authenticated users. Will evolve into
 * the user/organizer/admin landing inside the shell (Iteration 3+).
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Styles from './dashboard-styles.scss';
import { currentAccountState } from '@/presentation/components';
import { useRecoilValue } from 'recoil';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();

  const name = account?.user?.name ?? '';

  return (
    <div className={Styles.dashboardPage}>
      <Helmet>
        <title>HypePass — {t('dashboard.title')}</title>
      </Helmet>

      <div className={Styles.inner}>
        <div className={Styles.eyebrow}>{t('dashboard.title')}</div>
        <h1 className={Styles.title}>{t('dashboard.welcome', { name })}</h1>
        <p className={Styles.subtitle}>{t('dashboard.gettingStartedBody')}</p>

        <div className={Styles.card}>
          <h3 className={Styles.cardTitle}>
            {t('dashboard.gettingStartedTitle')}
          </h3>
          <p className={Styles.cardText}>
            {t('dashboard.gettingStartedBody')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/**
 * Dashboard Page (Protected)
 *
 * Example page only accessible to authenticated users.
 * This is wrapped by PrivateRoute in the router.
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Styles from './dashboard-styles.scss';
import { currentAccountState } from '@/presentation/components';
import { useRecoilValue } from 'recoil';
import { useLogout } from '@/presentation/hooks';

const Dashboard: React.FC = () => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const logout = useLogout();

  return (
    <div className={Styles.dashboardPage}>
      <Helmet>
        <title>Dashboard | App</title>
      </Helmet>

      <header className={Styles.header}>
        <div className={Styles.headerInner}>
          <span className={Styles.logo}>App</span>
          <div className={Styles.headerRight}>
            <span className={Styles.userName}>{account?.user?.name || 'User'}</span>
            <button className={Styles.logoutBtn} onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className={Styles.main}>
        <h1 className={Styles.title}>Dashboard</h1>
        <p className={Styles.subtitle}>
          Welcome, {account?.user?.name || 'User'}! This is a protected page.
        </p>

        <div className={Styles.card}>
          <h3 className={Styles.cardTitle}>Getting Started</h3>
          <p className={Styles.cardText}>
            This is an example protected page. Replace this content with your application's dashboard.
            You can access the current user via the <code>currentAccountState</code> Recoil atom.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

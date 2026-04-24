import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Styles from './nav-styles.scss';
import Logo from '../logo/logo';
import LanguageSwitcher from '../language-switcher/language-switcher';
import { currentAccountState } from '../atoms/atoms';
import { useLogout } from '@/presentation/hooks';

const Nav: React.FC = () => {
  const { t } = useTranslation();
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  const isAuth = !!account?.session;
  const role = account?.user?.role;
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  const navLinks: Array<{ to: string; label: string; show: boolean }> = [
    { to: '/', label: t('nav.discover'), show: true },
    { to: '/events', label: t('nav.explore'), show: true },
    { to: '/marketplace', label: t('nav.marketplace'), show: true },
    { to: '/wallet', label: t('nav.wallet'), show: isAuth },
    { to: '/organizer', label: t('nav.organizer'), show: isAuth },
    { to: '/admin', label: t('nav.admin'), show: role === 'platform_admin' },
  ];
  const drawerOnlyLinks: Array<{ to: string; label: string; show: boolean }> = [
    { to: '/profile', label: t('nav.profile'), show: isAuth },
    { to: '/faq', label: t('nav.faq'), show: true },
    { to: '/legal/terms', label: t('nav.terms'), show: true },
    { to: '/legal/privacy', label: t('nav.privacy'), show: true },
  ];

  return (
    <nav className={Styles.nav}>
      <div className={Styles.left}>
        <Link to="/" className={Styles.brand} aria-label="HypePass">
          <Logo size={36} />
        </Link>
        <div className={Styles.links}>
          {navLinks
            .filter((l) => l.show)
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `${Styles.link} ${isActive ? Styles.linkActive : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
        </div>
      </div>

      <div className={Styles.right}>
        <LanguageSwitcher />

        {isAuth ? (
          <div className={Styles.userCluster}>
            <Link
              to="/profile"
              className={Styles.avatar}
              title={account?.user?.name ?? t('nav.profile')}
              aria-label={t('nav.profile')}
            >
              {(account?.user?.name ?? 'U').slice(0, 2).toUpperCase()}
            </Link>
            <button
              type="button"
              className={Styles.logout}
              onClick={() => logout()}
            >
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <div className={Styles.authCluster}>
            <button
              type="button"
              className={Styles.ghostBtn}
              onClick={() => navigate('/login')}
            >
              {t('nav.login')}
            </button>
            <button
              type="button"
              className={Styles.primaryBtn}
              onClick={() => navigate('/signup')}
            >
              {t('nav.signup')}
            </button>
          </div>
        )}

        <button
          type="button"
          className={Styles.hamburger}
          onClick={() => setDrawerOpen(true)}
          aria-label={t('nav.openMenu')}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {drawerOpen && (
        <>
          <div className={Styles.drawerBackdrop} onClick={closeDrawer} />
          <aside className={Styles.drawer} role="dialog" aria-modal="true">
            <div className={Styles.drawerHeader}>
              <Logo />
              <button
                type="button"
                className={Styles.drawerClose}
                onClick={closeDrawer}
                aria-label={t('nav.closeMenu')}
              >
                ✕
              </button>
            </div>
            <div className={Styles.drawerLinks}>
              {[...navLinks, ...drawerOnlyLinks]
                .filter((l) => l.show)
                .map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `${Styles.drawerLink} ${isActive ? Styles.drawerLinkActive : ''}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
            </div>
            <div className={Styles.drawerFooter}>
              {isAuth ? (
                <button
                  type="button"
                  className={Styles.ghostBtn}
                  onClick={() => {
                    closeDrawer();
                    logout();
                  }}
                >
                  {t('nav.logout')}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={Styles.ghostBtn}
                    onClick={() => {
                      closeDrawer();
                      navigate('/login');
                    }}
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    type="button"
                    className={Styles.primaryBtn}
                    onClick={() => {
                      closeDrawer();
                      navigate('/signup');
                    }}
                  >
                    {t('nav.signup')}
                  </button>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </nav>
  );
};

export default Nav;

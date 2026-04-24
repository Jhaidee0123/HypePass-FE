/**
 * Proxy Pattern: PrivateRoute
 *
 * Auth guard that checks if the user has an active session. If not
 * authenticated, redirects to /login with `?next=<current-path>` so Login
 * can bounce the user back where they wanted to go after signing in.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { currentAccountState } from '@/presentation/components';
import { useRecoilValue } from 'recoil';

interface Props {
  children?: JSX.Element;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const location = useLocation();

  if (getCurrentAccount()?.session) {
    return <>{children}</>;
  }
  const next = `${location.pathname}${location.search}${location.hash}`;
  const target = `/login?next=${encodeURIComponent(next)}`;
  return <Navigate to={target} replace />;
};

export default PrivateRoute;

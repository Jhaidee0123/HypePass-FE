/**
 * Proxy Pattern: PrivateRoute
 *
 * Auth guard that checks if the user has an active session.
 * If not authenticated, redirects to /login.
 *
 * Usage in router:
 *   <PrivateRoute><DashboardPage /></PrivateRoute>
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { currentAccountState } from '@/presentation/components';
import { useRecoilValue } from 'recoil';

interface Props {
  children?: JSX.Element;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  return getCurrentAccount()?.session ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

/**
 * Proxy Pattern: AdminRoute
 *
 * Auth guard that checks both authentication AND admin role.
 * - No session -> redirect to /login
 * - Not admin -> redirect to /
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { currentAccountState } from '@/presentation/components';
import { useRecoilValue } from 'recoil';

interface Props {
  children?: JSX.Element;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState);
  const account = getCurrentAccount();
  if (!account?.session) return <Navigate to="/login" replace />;
  if (account?.user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminRoute;

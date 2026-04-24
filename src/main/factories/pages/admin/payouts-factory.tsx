import React from 'react';
import { AdminPayoutsPage } from '@/presentation/pages';
import { makeAdminPayouts } from '@/main/factories/usecases/admin-payouts';

export const AdminPayoutsFactory: React.FC = () => (
  <AdminPayoutsPage payouts={makeAdminPayouts()} />
);

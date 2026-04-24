import React from 'react';
import { Admin } from '@/presentation/pages';
import { makeAdminReview } from '@/main/factories/usecases/admin';

export const AdminFactory: React.FC = () => (
  <Admin review={makeAdminReview()} />
);

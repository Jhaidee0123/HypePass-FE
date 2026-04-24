import React from 'react';
import { CheckinPage } from '@/presentation/pages';
import { makeCheckin } from '@/main/factories/usecases/checkin';

export const CheckinPageFactory: React.FC = () => (
  <CheckinPage checkin={makeCheckin()} />
);

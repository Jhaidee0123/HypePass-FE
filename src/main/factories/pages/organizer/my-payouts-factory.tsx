import React from 'react';
import { MyPayoutsPage } from '@/presentation/pages';
import { makeMyPayouts } from '@/main/factories/usecases/my-payouts/my-payouts-factory';

export const MyPayoutsFactory: React.FC = () => (
  <MyPayoutsPage payouts={makeMyPayouts()} />
);

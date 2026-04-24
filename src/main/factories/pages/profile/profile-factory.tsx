import React from 'react';
import { Profile } from '@/presentation/pages';
import { makePayoutMethods } from '@/main/factories/usecases/payout-methods';

export const ProfileFactory: React.FC = () => (
  <Profile payoutMethods={makePayoutMethods()} />
);

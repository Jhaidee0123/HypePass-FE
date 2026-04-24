import React from 'react';
import { CheckoutPage } from '@/presentation/pages';
import { makeCheckout } from '@/main/factories/usecases/checkout';
import { makePublicEvents } from '@/main/factories/usecases/public';

export const CheckoutPageFactory: React.FC = () => (
  <CheckoutPage
    checkout={makeCheckout()}
    publicEvents={makePublicEvents()}
  />
);

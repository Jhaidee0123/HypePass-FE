import React from 'react';
import { CheckoutResult } from '@/presentation/pages';
import { makeCheckout } from '@/main/factories/usecases/checkout';

export const CheckoutResultFactory: React.FC = () => (
  <CheckoutResult checkout={makeCheckout()} />
);

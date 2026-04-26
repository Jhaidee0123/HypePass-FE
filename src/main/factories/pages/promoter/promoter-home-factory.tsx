import React from 'react';
import { PromoterHome } from '@/presentation/pages';
import { makePromoterSelf } from '@/main/factories/usecases/promoter';

export const PromoterHomeFactory: React.FC = () => (
  <PromoterHome promoter={makePromoterSelf()} />
);

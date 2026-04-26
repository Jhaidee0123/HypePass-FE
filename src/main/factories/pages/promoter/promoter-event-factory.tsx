import React from 'react';
import { PromoterEvent } from '@/presentation/pages';
import { makePromoterSelf } from '@/main/factories/usecases/promoter';

export const PromoterEventFactory: React.FC = () => (
  <PromoterEvent promoter={makePromoterSelf()} />
);

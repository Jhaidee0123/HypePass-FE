import React from 'react';
import { ListingDetailPage } from '@/presentation/pages';
import { makeMarketplace } from '@/main/factories/usecases/marketplace';

export const ListingDetailFactory: React.FC = () => (
  <ListingDetailPage marketplace={makeMarketplace()} />
);

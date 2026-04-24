import React from 'react';
import { MarketplacePage } from '@/presentation/pages';
import { makeMarketplace } from '@/main/factories/usecases/marketplace';

export const MarketplaceFactory: React.FC = () => (
  <MarketplacePage marketplace={makeMarketplace()} />
);

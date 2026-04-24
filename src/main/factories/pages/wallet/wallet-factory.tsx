import React from 'react';
import { WalletPage } from '@/presentation/pages';
import { makeWallet } from '@/main/factories/usecases/wallet';
import { makeMarketplace } from '@/main/factories/usecases/marketplace';
import { makeTransfer } from '@/main/factories/usecases/transfer';

export const WalletFactory: React.FC = () => (
  <WalletPage
    wallet={makeWallet()}
    marketplace={makeMarketplace()}
    transfer={makeTransfer()}
  />
);

import React from 'react';
import { TicketDetail } from '@/presentation/pages';
import { makeWallet } from '@/main/factories/usecases/wallet';
import { makeTransfer } from '@/main/factories/usecases/transfer';
import { makeMarketplace } from '@/main/factories/usecases/marketplace';
import { makePayoutMethods } from '@/main/factories/usecases/payout-methods';

export const TicketDetailFactory: React.FC = () => (
  <TicketDetail
    wallet={makeWallet()}
    transfer={makeTransfer()}
    marketplace={makeMarketplace()}
    payoutMethods={makePayoutMethods()}
  />
);

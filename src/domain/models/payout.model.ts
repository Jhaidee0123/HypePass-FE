export type PayoutStatus =
  | 'pending'
  | 'pending_event'
  | 'payable'
  | 'paid'
  | 'failed'
  | 'cancelled';

export type PayoutTransactionType =
  | 'reseller_payout'
  | 'organizer_sale_settlement'
  | 'refund';

export type PayoutRecord = {
  id: string;
  resaleListingId: string | null;
  sellerUserId: string | null;
  companyId: string | null;
  eventSessionId: string | null;
  transactionType: PayoutTransactionType;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: PayoutStatus;
  releaseAt: string | null;
  settledAt: string | null;
  payoutAccountType: string | null;
  payoutAccountBankName: string | null;
  payoutAccountNumber: string | null;
  payoutAccountHolderName: string | null;
  payoutAccountHolderLegalIdType: string | null;
  payoutAccountHolderLegalId: string | null;
  providerName: string | null;
  providerReference: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

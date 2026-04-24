import { PayoutRecord, PayoutStatus } from '@/domain/models';

export interface AdminPayouts {
  list(filter?: {
    status?: PayoutStatus;
    sellerUserId?: string;
  }): Promise<PayoutRecord[]>;
  markPaid(payoutId: string): Promise<PayoutRecord>;
  markFailed(payoutId: string): Promise<PayoutRecord>;
  cancel(payoutId: string): Promise<PayoutRecord>;
}

import axios from 'axios';
import { AdminPayouts } from '@/domain/usecases';
import { PayoutRecord, PayoutStatus } from '@/domain/models';

export class RemoteAdminPayouts implements AdminPayouts {
  constructor(private readonly apiEndpoint: string) {}

  async list(filter?: {
    status?: PayoutStatus;
    sellerUserId?: string;
  }): Promise<PayoutRecord[]> {
    const { data } = await axios.get<PayoutRecord[]>(
      `${this.apiEndpoint}/admin/payouts`,
      {
        params: filter ?? {},
        withCredentials: true,
      },
    );
    return data;
  }

  async markPaid(payoutId: string): Promise<PayoutRecord> {
    const { data } = await axios.patch<PayoutRecord>(
      `${this.apiEndpoint}/admin/payouts/${payoutId}/mark-paid`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  async markFailed(payoutId: string): Promise<PayoutRecord> {
    const { data } = await axios.patch<PayoutRecord>(
      `${this.apiEndpoint}/admin/payouts/${payoutId}/mark-failed`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  async cancel(payoutId: string): Promise<PayoutRecord> {
    const { data } = await axios.patch<PayoutRecord>(
      `${this.apiEndpoint}/admin/payouts/${payoutId}/cancel`,
      {},
      { withCredentials: true },
    );
    return data;
  }
}

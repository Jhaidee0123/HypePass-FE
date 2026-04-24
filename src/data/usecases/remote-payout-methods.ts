import axios from 'axios';
import {
  CreatePayoutMethodParams,
  PayoutMethods,
  UpdatePayoutMethodParams,
} from '@/domain/usecases';
import { PayoutMethod } from '@/domain/models';

export class RemotePayoutMethods implements PayoutMethods {
  constructor(private readonly apiEndpoint: string) {}

  async list(): Promise<PayoutMethod[]> {
    const { data } = await axios.get<PayoutMethod[]>(
      `${this.apiEndpoint}/profile/payout-methods`,
      { withCredentials: true },
    );
    return data;
  }

  async create(
    params: CreatePayoutMethodParams,
  ): Promise<PayoutMethod> {
    const { data } = await axios.post<PayoutMethod>(
      `${this.apiEndpoint}/profile/payout-methods`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async update(
    id: string,
    params: UpdatePayoutMethodParams,
  ): Promise<PayoutMethod> {
    const { data } = await axios.patch<PayoutMethod>(
      `${this.apiEndpoint}/profile/payout-methods/${id}`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async makeDefault(id: string): Promise<PayoutMethod> {
    const { data } = await axios.patch<PayoutMethod>(
      `${this.apiEndpoint}/profile/payout-methods/${id}/make-default`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(
      `${this.apiEndpoint}/profile/payout-methods/${id}`,
      { withCredentials: true },
    );
  }
}

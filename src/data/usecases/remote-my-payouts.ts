import axios from 'axios';
import { MyPayouts } from '@/domain/usecases';
import { PayoutRecord } from '@/domain/models';

export class RemoteMyPayouts implements MyPayouts {
  constructor(private readonly apiEndpoint: string) {}

  async list(): Promise<PayoutRecord[]> {
    const { data } = await axios.get<PayoutRecord[]>(
      `${this.apiEndpoint}/me/payouts`,
      { withCredentials: true },
    );
    return data;
  }
}

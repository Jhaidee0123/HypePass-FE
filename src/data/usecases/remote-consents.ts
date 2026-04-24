import axios from 'axios';
import { Consents, RecordConsentParams } from '@/domain/usecases';

export class RemoteConsents implements Consents {
  constructor(private readonly apiEndpoint: string) {}

  async record(params: RecordConsentParams): Promise<void> {
    await axios.post(
      `${this.apiEndpoint}/profile/consents`,
      params,
      { withCredentials: true },
    );
  }
}

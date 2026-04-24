import axios from 'axios';
import { Checkin, ScanParams } from '@/domain/usecases';
import { ScanResult } from '@/domain/models';

export class RemoteCheckin implements Checkin {
  constructor(private readonly apiEndpoint: string) {}

  async scan(params: ScanParams): Promise<ScanResult> {
    const { data } = await axios.post<ScanResult>(
      `${this.apiEndpoint}/checkin/scan`,
      params,
      { withCredentials: true },
    );
    return data;
  }
}

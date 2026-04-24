import { ScanResult } from '@/domain/models';

export type ScanParams = {
  token: string;
  expectedSessionId?: string;
  scannerDeviceId?: string;
};

export interface Checkin {
  scan(params: ScanParams): Promise<ScanResult>;
}

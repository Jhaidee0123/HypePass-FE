import { PayoutRecord } from '@/domain/models';

export interface MyPayouts {
  list(): Promise<PayoutRecord[]>;
}

import { TransferList, TransferResult } from '@/domain/models';

export type TransferTicketParams = {
  ticketId: string;
  recipientEmail: string;
  note?: string;
};

export interface Transfer {
  transfer(params: TransferTicketParams): Promise<TransferResult>;
  list(): Promise<TransferList>;
}

import { WalletQrResponse, WalletTicketView } from '@/domain/models';

export interface Wallet {
  list(): Promise<WalletTicketView[]>;
  get(ticketId: string): Promise<WalletTicketView>;
  getQr(ticketId: string): Promise<WalletQrResponse>;
}

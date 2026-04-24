import axios from 'axios';
import { Wallet } from '@/domain/usecases';
import { WalletQrResponse, WalletTicketView } from '@/domain/models';

export class RemoteWallet implements Wallet {
  constructor(private readonly apiEndpoint: string) {}

  async list(): Promise<WalletTicketView[]> {
    const { data } = await axios.get<WalletTicketView[]>(
      `${this.apiEndpoint}/wallet/tickets`,
      { withCredentials: true },
    );
    return data;
  }

  async get(ticketId: string): Promise<WalletTicketView> {
    const { data } = await axios.get<WalletTicketView>(
      `${this.apiEndpoint}/wallet/tickets/${ticketId}`,
      { withCredentials: true },
    );
    return data;
  }

  async getQr(ticketId: string): Promise<WalletQrResponse> {
    const { data } = await axios.get<WalletQrResponse>(
      `${this.apiEndpoint}/wallet/tickets/${ticketId}/qr`,
      { withCredentials: true },
    );
    return data;
  }
}

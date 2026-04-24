import axios from 'axios';
import { Transfer, TransferTicketParams } from '@/domain/usecases';
import { TransferList, TransferResult } from '@/domain/models';

export class RemoteTransfer implements Transfer {
  constructor(private readonly apiEndpoint: string) {}

  async transfer(params: TransferTicketParams): Promise<TransferResult> {
    const { data } = await axios.post<TransferResult>(
      `${this.apiEndpoint}/wallet/tickets/${params.ticketId}/transfer`,
      { recipientEmail: params.recipientEmail, note: params.note },
      { withCredentials: true },
    );
    return data;
  }

  async list(): Promise<TransferList> {
    const { data } = await axios.get<TransferList>(
      `${this.apiEndpoint}/wallet/transfers`,
      { withCredentials: true },
    );
    return data;
  }
}

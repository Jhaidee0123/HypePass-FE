import axios from 'axios';
import {
  AssignPromoterRecipient,
  AssignPromotersResult,
  EventPromoterRow,
  EventPromoters,
  MyPromotedEventRow,
  PromoterSalesResult,
  PromoterSelf,
} from '@/domain/usecases';

export class RemoteEventPromoters implements EventPromoters {
  constructor(private readonly apiEndpoint: string) {}

  async list(
    companyId: string,
    eventId: string,
    sessionId?: string,
  ): Promise<EventPromoterRow[]> {
    const { data } = await axios.get<EventPromoterRow[]>(
      `${this.apiEndpoint}/companies/${companyId}/events/${eventId}/promoters`,
      {
        withCredentials: true,
        params: sessionId ? { sessionId } : undefined,
      },
    );
    return data;
  }

  async assign(
    companyId: string,
    eventId: string,
    recipients: AssignPromoterRecipient[],
  ): Promise<AssignPromotersResult> {
    const { data } = await axios.post<AssignPromotersResult>(
      `${this.apiEndpoint}/companies/${companyId}/events/${eventId}/promoters`,
      { recipients },
      { withCredentials: true },
    );
    return data;
  }

  async revoke(
    companyId: string,
    eventId: string,
    userId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.apiEndpoint}/companies/${companyId}/events/${eventId}/promoters/${userId}`,
      { withCredentials: true },
    );
  }
}

export class RemotePromoterSelf implements PromoterSelf {
  constructor(private readonly apiEndpoint: string) {}

  async listEvents(): Promise<MyPromotedEventRow[]> {
    const { data } = await axios.get<MyPromotedEventRow[]>(
      `${this.apiEndpoint}/me/promoter/events`,
      { withCredentials: true },
    );
    return data;
  }

  async getSales(eventId: string): Promise<PromoterSalesResult> {
    const { data } = await axios.get<PromoterSalesResult>(
      `${this.apiEndpoint}/me/promoter/events/${eventId}/sales`,
      { withCredentials: true },
    );
    return data;
  }
}

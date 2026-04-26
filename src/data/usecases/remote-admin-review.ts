import axios from 'axios';
import { AdminReview } from '@/domain/usecases';
import {
  CompanyModel,
  CompanyStatus,
  EventForReview,
  EventModel,
  EventStatus,
} from '@/domain/models';

export class RemoteAdminReview implements AdminReview {
  constructor(private readonly apiEndpoint: string) {}

  // ===== events =====

  async listEvents(status?: EventStatus): Promise<EventModel[]> {
    const { data } = await axios.get<EventModel[]>(
      `${this.apiEndpoint}/admin/events`,
      {
        withCredentials: true,
        params: status ? { status } : undefined,
      },
    );
    return data;
  }

  async getEvent(eventId: string): Promise<EventForReview> {
    const { data } = await axios.get<EventForReview>(
      `${this.apiEndpoint}/admin/events/${eventId}`,
      { withCredentials: true },
    );
    return data;
  }

  async approveEvent(
    eventId: string,
    notes?: string,
  ): Promise<EventModel> {
    const { data } = await axios.patch<EventModel>(
      `${this.apiEndpoint}/admin/events/${eventId}/approve`,
      { reviewNotes: notes },
      { withCredentials: true },
    );
    return data;
  }

  async rejectEvent(
    eventId: string,
    notes: string,
  ): Promise<EventModel> {
    const { data } = await axios.patch<EventModel>(
      `${this.apiEndpoint}/admin/events/${eventId}/reject`,
      { reviewNotes: notes },
      { withCredentials: true },
    );
    return data;
  }

  async publishEvent(eventId: string): Promise<EventModel> {
    const { data } = await axios.patch<EventModel>(
      `${this.apiEndpoint}/admin/events/${eventId}/publish`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  async unpublishEvent(eventId: string): Promise<EventModel> {
    const { data } = await axios.patch<EventModel>(
      `${this.apiEndpoint}/admin/events/${eventId}/unpublish`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  // ===== companies =====

  async listCompanies(
    status?: CompanyStatus,
    search?: string,
  ): Promise<CompanyModel[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (search && search.trim()) params.search = search.trim();
    const { data } = await axios.get<CompanyModel[]>(
      `${this.apiEndpoint}/admin/companies`,
      {
        withCredentials: true,
        params: Object.keys(params).length ? params : undefined,
      },
    );
    return data;
  }

  async approveCompany(
    companyId: string,
    notes?: string,
  ): Promise<CompanyModel> {
    const { data } = await axios.patch<CompanyModel>(
      `${this.apiEndpoint}/admin/companies/${companyId}/approve`,
      { reviewNotes: notes },
      { withCredentials: true },
    );
    return data;
  }

  async rejectCompany(
    companyId: string,
    notes?: string,
  ): Promise<CompanyModel> {
    const { data } = await axios.patch<CompanyModel>(
      `${this.apiEndpoint}/admin/companies/${companyId}/reject`,
      { reviewNotes: notes },
      { withCredentials: true },
    );
    return data;
  }

  async suspendCompany(
    companyId: string,
    reason: string,
  ): Promise<CompanyModel> {
    const { data } = await axios.patch<CompanyModel>(
      `${this.apiEndpoint}/admin/companies/${companyId}/suspend`,
      { reason },
      { withCredentials: true },
    );
    return data;
  }

  async reinstateCompany(companyId: string): Promise<CompanyModel> {
    const { data } = await axios.patch<CompanyModel>(
      `${this.apiEndpoint}/admin/companies/${companyId}/reinstate`,
      {},
      { withCredentials: true },
    );
    return data;
  }
}

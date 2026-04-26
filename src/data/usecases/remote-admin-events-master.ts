import axios from 'axios';
import { AdminEventsMaster } from '@/domain/usecases';
import { EventModel, EventStatus } from '@/domain/models';

export class RemoteAdminEventsMaster implements AdminEventsMaster {
  constructor(private readonly apiEndpoint: string) {}

  async list(filter: {
    status?: EventStatus;
    companyId?: string;
    search?: string;
  }): Promise<EventModel[]> {
    const params: Record<string, string> = {};
    if (filter.status) params.status = filter.status;
    if (filter.companyId) params.companyId = filter.companyId;
    if (filter.search && filter.search.trim()) params.search = filter.search.trim();
    const { data } = await axios.get<EventModel[]>(
      `${this.apiEndpoint}/admin/events/master`,
      {
        withCredentials: true,
        params: Object.keys(params).length ? params : undefined,
      },
    );
    return data;
  }
}

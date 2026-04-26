import { EventModel, EventStatus } from '@/domain/models';

export interface AdminEventsMaster {
  list(filter: {
    status?: EventStatus;
    companyId?: string;
    search?: string;
  }): Promise<EventModel[]>;
}

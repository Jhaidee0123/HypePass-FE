import {
  CompanyModel,
  EventForReview,
  EventModel,
  EventStatus,
  CompanyStatus,
} from '@/domain/models';

export interface AdminReview {
  // Events
  listEvents(status?: EventStatus): Promise<EventModel[]>;
  getEvent(eventId: string): Promise<EventForReview>;
  approveEvent(eventId: string, notes?: string): Promise<EventModel>;
  rejectEvent(eventId: string, notes: string): Promise<EventModel>;
  publishEvent(eventId: string): Promise<EventModel>;
  unpublishEvent(eventId: string): Promise<EventModel>;

  // Companies
  listCompanies(
    status?: CompanyStatus,
    search?: string,
  ): Promise<CompanyModel[]>;
  approveCompany(companyId: string, notes?: string): Promise<CompanyModel>;
  rejectCompany(companyId: string, notes?: string): Promise<CompanyModel>;
  suspendCompany(companyId: string, reason: string): Promise<CompanyModel>;
  reinstateCompany(companyId: string): Promise<CompanyModel>;
}

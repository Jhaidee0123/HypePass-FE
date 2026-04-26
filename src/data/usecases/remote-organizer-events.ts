import axios from 'axios';
import {
  AddMediaParams,
  AssignEventStaffParams,
  AssignEventStaffResult,
  CreateEventParams,
  CreatePhaseParams,
  CreateSectionParams,
  CreateSessionParams,
  EventAttendeesQuery,
  EventAttendeesResult,
  EventStaffMember,
  IssueCourtesiesParams,
  IssueCourtesiesResult,
  OrganizerEvents,
  UpdateEventParams,
  UpdatePhaseParams,
  UpdateSectionParams,
  UpdateSessionParams,
} from '@/domain/usecases';
import {
  EventMediaModel,
  EventModel,
  EventSessionModel,
  EventWithChildren,
  SalesSummary,
  TicketSalePhaseModel,
  TicketSectionModel,
} from '@/domain/models';

export class RemoteOrganizerEvents implements OrganizerEvents {
  constructor(private readonly apiEndpoint: string) {}

  private base(companyId: string) {
    return `${this.apiEndpoint}/companies/${companyId}/events`;
  }

  async list(companyId: string): Promise<EventModel[]> {
    const { data } = await axios.get<EventModel[]>(this.base(companyId), {
      withCredentials: true,
    });
    return data;
  }

  async get(
    companyId: string,
    eventId: string,
  ): Promise<EventWithChildren> {
    const { data } = await axios.get<EventWithChildren>(
      `${this.base(companyId)}/${eventId}`,
      { withCredentials: true },
    );
    return data;
  }

  async create(
    companyId: string,
    params: CreateEventParams,
  ): Promise<EventModel> {
    const { data } = await axios.post<EventModel>(
      this.base(companyId),
      params,
      { withCredentials: true },
    );
    return data;
  }

  async update(
    companyId: string,
    eventId: string,
    params: UpdateEventParams,
  ): Promise<EventModel> {
    const { data } = await axios.patch<EventModel>(
      `${this.base(companyId)}/${eventId}`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async delete(companyId: string, eventId: string): Promise<void> {
    await axios.delete(`${this.base(companyId)}/${eventId}`, {
      withCredentials: true,
    });
  }

  async submitForReview(
    companyId: string,
    eventId: string,
    notes?: string,
  ): Promise<EventModel> {
    const { data } = await axios.post<EventModel>(
      `${this.base(companyId)}/${eventId}/submit-review`,
      { notes },
      { withCredentials: true },
    );
    return data;
  }

  async getSalesSummary(
    companyId: string,
    eventId: string,
  ): Promise<SalesSummary> {
    const { data } = await axios.get<SalesSummary>(
      `${this.base(companyId)}/${eventId}/sales-summary`,
      { withCredentials: true },
    );
    return data;
  }

  async issueCourtesies(
    companyId: string,
    eventId: string,
    params: IssueCourtesiesParams,
  ): Promise<IssueCourtesiesResult> {
    const { data } = await axios.post<IssueCourtesiesResult>(
      `${this.base(companyId)}/${eventId}/courtesies`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async listEventStaff(
    companyId: string,
    eventId: string,
  ): Promise<EventStaffMember[]> {
    const { data } = await axios.get<EventStaffMember[]>(
      `${this.base(companyId)}/${eventId}/staff`,
      { withCredentials: true },
    );
    return data;
  }

  async listAttendees(
    companyId: string,
    eventId: string,
    query: EventAttendeesQuery,
  ): Promise<EventAttendeesResult> {
    const params: Record<string, string | number> = {};
    if (query.sessionId) params.sessionId = query.sessionId;
    if (query.sectionId) params.sectionId = query.sectionId;
    if (query.type) params.type = query.type;
    if (query.q && query.q.trim()) params.q = query.q.trim();
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.offset !== undefined) params.offset = query.offset;
    const { data } = await axios.get<EventAttendeesResult>(
      `${this.base(companyId)}/${eventId}/attendees`,
      { withCredentials: true, params },
    );
    return data;
  }

  async assignEventStaff(
    companyId: string,
    eventId: string,
    params: AssignEventStaffParams,
  ): Promise<AssignEventStaffResult> {
    const { data } = await axios.post<AssignEventStaffResult>(
      `${this.base(companyId)}/${eventId}/staff`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async revokeEventStaff(
    companyId: string,
    eventId: string,
    userId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.base(companyId)}/${eventId}/staff/${userId}`,
      { withCredentials: true },
    );
  }

  async addSession(
    companyId: string,
    eventId: string,
    params: CreateSessionParams,
  ): Promise<EventSessionModel> {
    const { data } = await axios.post<EventSessionModel>(
      `${this.base(companyId)}/${eventId}/sessions`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async updateSession(
    companyId: string,
    eventId: string,
    sessionId: string,
    params: UpdateSessionParams,
  ): Promise<EventSessionModel> {
    const { data } = await axios.patch<EventSessionModel>(
      `${this.base(companyId)}/${eventId}/sessions/${sessionId}`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async deleteSession(
    companyId: string,
    eventId: string,
    sessionId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.base(companyId)}/${eventId}/sessions/${sessionId}`,
      { withCredentials: true },
    );
  }

  async addSection(
    companyId: string,
    eventId: string,
    sessionId: string,
    params: CreateSectionParams,
  ): Promise<TicketSectionModel> {
    const { data } = await axios.post<TicketSectionModel>(
      `${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async updateSection(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    params: UpdateSectionParams,
  ): Promise<TicketSectionModel> {
    const { data } = await axios.patch<TicketSectionModel>(
      `${this.base(
        companyId,
      )}/${eventId}/sessions/${sessionId}/sections/${sectionId}`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async deleteSection(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.base(
        companyId,
      )}/${eventId}/sessions/${sessionId}/sections/${sectionId}`,
      { withCredentials: true },
    );
  }

  async addPhase(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    params: CreatePhaseParams,
  ): Promise<TicketSalePhaseModel> {
    const { data } = await axios.post<TicketSalePhaseModel>(
      `${this.base(
        companyId,
      )}/${eventId}/sessions/${sessionId}/sections/${sectionId}/phases`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async updatePhase(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    phaseId: string,
    params: UpdatePhaseParams,
  ): Promise<TicketSalePhaseModel> {
    const { data } = await axios.patch<TicketSalePhaseModel>(
      `${this.base(
        companyId,
      )}/${eventId}/sessions/${sessionId}/sections/${sectionId}/phases/${phaseId}`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async deletePhase(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    phaseId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.base(
        companyId,
      )}/${eventId}/sessions/${sessionId}/sections/${sectionId}/phases/${phaseId}`,
      { withCredentials: true },
    );
  }

  async addMedia(
    companyId: string,
    eventId: string,
    params: AddMediaParams,
  ): Promise<EventMediaModel> {
    const { data } = await axios.post<EventMediaModel>(
      `${this.base(companyId)}/${eventId}/media`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async removeMedia(
    companyId: string,
    eventId: string,
    mediaId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.base(companyId)}/${eventId}/media/${mediaId}`,
      { withCredentials: true },
    );
  }
}

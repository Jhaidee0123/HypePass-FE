import {
  EventMediaModel,
  EventMediaType,
  EventModel,
  EventSessionModel,
  EventWithChildren,
  SalesSummary,
  TicketSalePhaseModel,
  TicketSectionModel,
} from '../models';

export type CreateEventParams = {
  title: string;
  slug: string;
  categoryId?: string;
  venueId?: string;
  shortDescription?: string;
  description?: string;
  coverImageUrl?: string;
  bannerImageUrl?: string;
  resaleEnabled?: boolean;
  transferEnabled?: boolean;
  defaultQrVisibleHoursBefore?: number;
  currency?: string;
};

export type UpdateEventParams = Partial<CreateEventParams>;

export type CreateSessionParams = {
  name?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  salesStartAt?: string;
  salesEndAt?: string;
  doorsOpenAt?: string;
  checkinStartAt?: string;
  transferCutoffAt?: string;
  resaleCutoffAt?: string;
  qrVisibleFrom?: string;
};

export type UpdateSessionParams = Partial<CreateSessionParams>;

export type CreateSectionParams = {
  name: string;
  description?: string;
  totalInventory: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  resaleAllowed?: boolean;
  transferAllowed?: boolean;
  sortOrder?: number;
};

export type UpdateSectionParams = Partial<CreateSectionParams>;

export type CreatePhaseParams = {
  name: string;
  startsAt: string;
  endsAt: string;
  /** minor units (COP cents). */
  price: number;
  currency?: string;
  serviceFee?: number;
  platformFee?: number;
  taxAmount?: number;
  maxPerOrder?: number;
  maxPerUser?: number;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdatePhaseParams = Partial<CreatePhaseParams>;

export type AddMediaParams = {
  url: string;
  publicId?: string;
  type: EventMediaType;
  alt?: string;
  sortOrder?: number;
};

export type CourtesyRecipientInput = {
  fullName: string;
  email: string;
  legalId: string;
  legalIdType: string;
  note?: string;
};

export type IssueCourtesiesParams = {
  eventSessionId: string;
  ticketSectionId: string;
  recipients: CourtesyRecipientInput[];
};

export type IssueCourtesiesResult = {
  issued: Array<{
    ticketId: string;
    recipientEmail: string;
    recipientName: string;
  }>;
  createdAccounts: string[];
  reusedAccounts: string[];
};

// ===== per-event staff =====

export type EventStaffRoleValue = 'checkin_staff';

export type AssignStaffRecipientInput = {
  fullName: string;
  email: string;
  role: EventStaffRoleValue;
  note?: string;
};

export type AssignEventStaffParams = {
  recipients: AssignStaffRecipientInput[];
};

export type AssignEventStaffResult = {
  assigned: Array<{
    userId: string;
    email: string;
    role: EventStaffRoleValue;
  }>;
  createdAccounts: string[];
  reusedAccounts: string[];
  alreadyAssigned: string[];
};

export type EventStaffMember = {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: EventStaffRoleValue;
  note: string | null;
  assignedByUserId: string;
  createdAt: string;
};

export interface OrganizerEvents {
  list(companyId: string): Promise<EventModel[]>;
  get(companyId: string, eventId: string): Promise<EventWithChildren>;
  create(
    companyId: string,
    params: CreateEventParams,
  ): Promise<EventModel>;
  update(
    companyId: string,
    eventId: string,
    params: UpdateEventParams,
  ): Promise<EventModel>;
  delete(companyId: string, eventId: string): Promise<void>;
  submitForReview(
    companyId: string,
    eventId: string,
    notes?: string,
  ): Promise<EventModel>;
  getSalesSummary(
    companyId: string,
    eventId: string,
  ): Promise<SalesSummary>;
  issueCourtesies(
    companyId: string,
    eventId: string,
    params: IssueCourtesiesParams,
  ): Promise<IssueCourtesiesResult>;
  listEventStaff(
    companyId: string,
    eventId: string,
  ): Promise<EventStaffMember[]>;
  assignEventStaff(
    companyId: string,
    eventId: string,
    params: AssignEventStaffParams,
  ): Promise<AssignEventStaffResult>;
  revokeEventStaff(
    companyId: string,
    eventId: string,
    userId: string,
  ): Promise<void>;

  addSession(
    companyId: string,
    eventId: string,
    params: CreateSessionParams,
  ): Promise<EventSessionModel>;
  updateSession(
    companyId: string,
    eventId: string,
    sessionId: string,
    params: UpdateSessionParams,
  ): Promise<EventSessionModel>;
  deleteSession(
    companyId: string,
    eventId: string,
    sessionId: string,
  ): Promise<void>;

  addSection(
    companyId: string,
    eventId: string,
    sessionId: string,
    params: CreateSectionParams,
  ): Promise<TicketSectionModel>;
  updateSection(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    params: UpdateSectionParams,
  ): Promise<TicketSectionModel>;
  deleteSection(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
  ): Promise<void>;

  addPhase(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    params: CreatePhaseParams,
  ): Promise<TicketSalePhaseModel>;
  updatePhase(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    phaseId: string,
    params: UpdatePhaseParams,
  ): Promise<TicketSalePhaseModel>;
  deletePhase(
    companyId: string,
    eventId: string,
    sessionId: string,
    sectionId: string,
    phaseId: string,
  ): Promise<void>;

  addMedia(
    companyId: string,
    eventId: string,
    params: AddMediaParams,
  ): Promise<EventMediaModel>;
  removeMedia(
    companyId: string,
    eventId: string,
    mediaId: string,
  ): Promise<void>;
}

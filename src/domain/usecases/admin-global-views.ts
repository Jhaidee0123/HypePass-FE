export type CourtesyRow = {
  ticketId: string;
  createdAt: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  sectionName: string | null;
  ownerUserId: string;
  ownerEmail: string | null;
  ownerName: string | null;
  status: string;
  faceValue: number;
  currency: string;
};

export type StaffAssignmentRow = {
  id: string;
  createdAt: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  role: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  note: string | null;
  assignedByUserId: string;
};

export interface AdminGlobalViews {
  listCourtesies(limit?: number): Promise<CourtesyRow[]>;
  listStaff(limit?: number): Promise<StaffAssignmentRow[]>;
}

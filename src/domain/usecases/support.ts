export type SupportTicketKind = 'support' | 'dispute' | 'kyc';
export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type SupportTicketRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  kind: SupportTicketKind;
  status: SupportTicketStatus;
  subject: string;
  body: string;
  userId: string | null;
  guestEmail: string | null;
  relatedOrderId: string | null;
  relatedCompanyId: string | null;
  relatedEventId: string | null;
  attachments: string[] | null;
  assignedToUserId: string | null;
  resolvedAt: string | null;
};

export type SupportMessageRow = {
  id: string;
  createdAt: string;
  ticketId: string;
  authorKind: 'user' | 'admin';
  authorUserId: string | null;
  body: string;
  attachments: string[] | null;
};

export type SupportTicketDetail = {
  ticket: SupportTicketRow;
  messages: SupportMessageRow[];
};

export type CreateSupportInput = {
  kind: SupportTicketKind;
  subject: string;
  body: string;
  guestEmail?: string;
  relatedOrderId?: string;
  relatedCompanyId?: string;
  relatedEventId?: string;
};

export interface PublicSupport {
  open(input: CreateSupportInput): Promise<SupportTicketRow>;
}

export interface AdminSupport {
  list(filter: {
    kind?: SupportTicketKind;
    status?: SupportTicketStatus;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: SupportTicketRow[]; total: number }>;
  detail(id: string): Promise<SupportTicketDetail>;
  reply(id: string, body: string): Promise<SupportMessageRow>;
  setStatus(id: string, status: SupportTicketStatus): Promise<SupportTicketRow>;
}

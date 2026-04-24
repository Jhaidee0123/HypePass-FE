export type TicketStatus =
  | 'issued'
  | 'listed'
  | 'reserved_for_resale'
  | 'transferred'
  | 'checked_in'
  | 'refunded'
  | 'voided'
  | 'expired';

export type TicketModel = {
  id: string;
  orderItemId: string;
  originalOrderId: string;
  currentOwnerUserId: string;
  eventId: string;
  eventSessionId: string;
  ticketSectionId: string;
  ticketSalePhaseId: string | null;
  status: TicketStatus;
  ownershipVersion: number;
  faceValue: number;
  latestSalePrice: number | null;
  currency: string;
  qrGenerationVersion: number;
  createdAt?: string;
  updatedAt?: string;
};

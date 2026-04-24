export type TicketTransferStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'rejected';

export type TicketTransferModel = {
  id: string;
  ticketId: string;
  fromUserId: string;
  toUserId: string;
  status: TicketTransferStatus;
  note: string | null;
  initiatedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  resultingOwnershipVersion: number | null;
  resultingQrGenerationVersion: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TransferResult = {
  transferId: string;
  ticketId: string;
  fromUserId: string;
  toUserId: string;
  completedAt: string;
  newOwnershipVersion: number;
  newQrGenerationVersion: number;
};

export type TransferList = {
  sent: TicketTransferModel[];
  received: TicketTransferModel[];
};

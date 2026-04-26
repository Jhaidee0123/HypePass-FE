export type AdminOrderRow = {
  id: string;
  createdAt: string;
  status: string;
  type: 'primary' | 'resale';
  currency: string;
  grandTotal: number;
  platformFeeTotal: number;
  paymentReference: string;
  buyerEmail: string;
  buyerFullName: string;
  needsReconciliation: boolean;
  reconciliationReason: string | null;
  companyId: string | null;
};

export type AdminOrdersListResult = {
  items: AdminOrderRow[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminOrdersQuery = {
  q?: string;
  status?: string;
  type?: 'primary' | 'resale';
  needsReconciliation?: boolean;
  companyId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type AdminOrderDetail = {
  order: AdminOrderRow;
  buyer: {
    email: string;
    fullName: string;
    phone: string | null;
    legalId: string | null;
    legalIdType: string | null;
  };
  items: Array<{
    id: string;
    eventId: string;
    eventSessionId: string;
    ticketSectionId: string;
    ticketSalePhaseId: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  tickets: Array<{
    id: string;
    status: string;
    ownerUserId: string;
    eventId: string;
    createdAt: string;
  }>;
};

export interface AdminOrders {
  list(query: AdminOrdersQuery): Promise<AdminOrdersListResult>;
  detail(id: string): Promise<AdminOrderDetail>;
  markReconciled(id: string): Promise<AdminOrderRow>;
}

export type EventPromoterRow = {
  id: string;
  userId: string;
  email: string;
  name: string;
  referralCode: string;
  note: string | null;
  revokedAt: string | null;
  createdAt: string;
  ticketsSold: number;
  ordersCount: number;
  grossRevenue: number;
  currency: string;
};

export type AssignPromoterRecipient = {
  email: string;
  fullName: string;
  note?: string;
};

export type AssignPromotersResult = {
  assigned: Array<{ userId: string; email: string; referralCode: string }>;
  createdAccounts: string[];
  reusedAccounts: string[];
  alreadyAssigned: string[];
};

export interface EventPromoters {
  list(companyId: string, eventId: string): Promise<EventPromoterRow[]>;
  assign(
    companyId: string,
    eventId: string,
    recipients: AssignPromoterRecipient[],
  ): Promise<AssignPromotersResult>;
  revoke(companyId: string, eventId: string, userId: string): Promise<void>;
}

// ===== promoter self =====

export type MyPromotedEventRow = {
  eventId: string;
  title: string;
  slug: string;
  status: string;
  coverImageUrl: string | null;
  referralCode: string;
  revokedAt: string | null;
  referralLink: string;
  ticketsSold: number;
  ordersCount: number;
  grossRevenue: number;
  currency: string;
};

export type PromoterSaleOrderRow = {
  orderId: string;
  paymentReference: string;
  createdAt: string;
  status: string;
  buyerEmailMasked: string;
  quantity: number;
  grossTotal: number;
  currency: string;
};

export type PromoterSalesResult = {
  event: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
  };
  referralCode: string;
  referralLink: string;
  revokedAt: string | null;
  summary: {
    ticketsSold: number;
    ordersCount: number;
    grossRevenue: number;
    currency: string;
  };
  orders: PromoterSaleOrderRow[];
};

export interface PromoterSelf {
  listEvents(): Promise<MyPromotedEventRow[]>;
  getSales(eventId: string): Promise<PromoterSalesResult>;
}

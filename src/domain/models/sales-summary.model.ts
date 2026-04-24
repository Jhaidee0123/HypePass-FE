export type SalesSummarySection = {
  id: string;
  name: string;
  sortOrder: number;
  capacity: number;
  sold: number;
  checkedIn: number;
  reserved: number;
  courtesies: number;
  available: number;
  grossRevenue: number;
  currency: string;
};

export type SalesSummaryTotals = {
  capacity: number;
  sold: number;
  checkedIn: number;
  reserved: number;
  courtesies: number;
  available: number;
  grossRevenue: number;
  currency: string;
};

export type SalesSummarySession = {
  id: string;
  name: string | null;
  startsAt: string;
  endsAt: string;
  totals: SalesSummaryTotals;
  sections: SalesSummarySection[];
};

export type SalesSummary = {
  event: {
    id: string;
    title: string;
    currency: string;
  };
  sessions: SalesSummarySession[];
  totals: SalesSummaryTotals;
  generatedAt: string;
};

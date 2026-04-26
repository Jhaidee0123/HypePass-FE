export type AdminDashboardKpis = {
  revenue: {
    total: number;
    platformFees: number;
    last30d: number;
    today: number;
    ordersCount: number;
  };
  tickets: {
    totalIssued: number;
    checkedIn: number;
    courtesies: number;
    listed: number;
  };
  events: {
    published: number;
    pendingReview: number;
    draft: number;
    approved: number;
    cancelledOrEnded: number;
  };
  companies: {
    active: number;
    pending: number;
    rejected: number;
  };
  users: {
    total: number;
    newToday: number;
    last30d: number;
    platformAdmins: number;
  };
  marketplace: {
    activeListings: number;
    soldCount: number;
    gmv: number;
  };
  payouts: {
    pendingEvent: { count: number; amount: number };
    payable: { count: number; amount: number };
    paid: { count: number; amount: number };
    failed: { count: number; amount: number };
  };
};

export type AdminDashboardSeries = {
  revenueByDay: Array<{ day: string; revenue: number; orders: number }>;
  ticketsByDay: Array<{ day: string; count: number }>;
  signupsByDay: Array<{ day: string; count: number }>;
};

export type AdminDashboardTop = {
  topEventsByRevenue: Array<{
    eventId: string;
    slug: string;
    title: string;
    revenue: number;
    ticketsSold: number;
  }>;
  topOrganizersByGmv: Array<{
    companyId: string;
    slug: string;
    name: string;
    gmv: number;
    eventsCount: number;
  }>;
};

export type AdminDashboardHealth = {
  db: { status: 'ok' | 'error'; latencyMs: number };
  uptimeSec: number;
  needsReconciliation: number;
};

export type AdminDashboardResponse = {
  kpis: AdminDashboardKpis;
  series: AdminDashboardSeries;
  top: AdminDashboardTop;
  health: AdminDashboardHealth;
  generatedAt: string;
};

export interface AdminDashboard {
  get(): Promise<AdminDashboardResponse>;
}

export type AdminNotificationLevel = 'info' | 'warn' | 'error';
export type AdminNotificationKind =
  | 'company.submitted'
  | 'event.submitted'
  | 'order.oversold'
  | 'payout.ready'
  | 'system.error';

export type AdminNotificationRow = {
  id: string;
  createdAt: string;
  level: AdminNotificationLevel;
  kind: AdminNotificationKind;
  title: string;
  body: string | null;
  metadata: Record<string, unknown> | null;
  acknowledgedAt: string | null;
  acknowledgedByUserId: string | null;
};

export type AdminNotificationsListResult = {
  items: AdminNotificationRow[];
  unackCount: number;
};

export interface AdminNotifications {
  list(unackOnly?: boolean): Promise<AdminNotificationsListResult>;
  ack(id: string): Promise<AdminNotificationRow>;
  ackAll(): Promise<{ acknowledged: number }>;
}

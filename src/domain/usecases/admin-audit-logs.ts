export type AuditActorKind = 'user' | 'system';

export type AdminAuditLogItem = {
  id: string;
  createdAt: string;
  actorKind: AuditActorKind;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
};

export type AdminAuditLogsQuery = {
  targetType?: string;
  targetId?: string;
  actorUserId?: string;
  actorKind?: AuditActorKind;
  action?: string;
  actionPrefix?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type AdminAuditLogsResponse = {
  items: AdminAuditLogItem[];
  total: number;
  limit: number;
  offset: number;
};

export interface AdminAuditLogs {
  list(query: AdminAuditLogsQuery): Promise<AdminAuditLogsResponse>;
}

export type SystemLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type SystemLogEntry = {
  time: string;
  level: number;
  levelLabel: string;
  msg: string;
  context?: string;
  raw: Record<string, unknown>;
};

export type SystemLogsQuery = {
  level?: SystemLogLevel;
  contains?: string;
  limit?: number;
};

export type SystemLogsResponse = {
  items: SystemLogEntry[];
  capacity: number;
  note: string;
};

export interface AdminSystemLogs {
  list(query: SystemLogsQuery): Promise<SystemLogsResponse>;
}

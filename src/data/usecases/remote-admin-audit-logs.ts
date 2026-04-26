import axios from 'axios';
import {
  AdminAuditLogs,
  AdminAuditLogsQuery,
  AdminAuditLogsResponse,
  AdminSystemLogs,
  SystemLogsQuery,
  SystemLogsResponse,
} from '@/domain/usecases';

const stripUndefined = (obj: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) out[k] = v;
  });
  return out;
};

export class RemoteAdminAuditLogs implements AdminAuditLogs {
  constructor(private readonly apiEndpoint: string) {}

  async list(query: AdminAuditLogsQuery): Promise<AdminAuditLogsResponse> {
    const { data } = await axios.get<AdminAuditLogsResponse>(
      `${this.apiEndpoint}/admin/audit-logs`,
      { withCredentials: true, params: stripUndefined(query as Record<string, unknown>) },
    );
    return data;
  }
}

export class RemoteAdminSystemLogs implements AdminSystemLogs {
  constructor(private readonly apiEndpoint: string) {}

  async list(query: SystemLogsQuery): Promise<SystemLogsResponse> {
    const { data } = await axios.get<SystemLogsResponse>(
      `${this.apiEndpoint}/admin/system-logs`,
      { withCredentials: true, params: stripUndefined(query as Record<string, unknown>) },
    );
    return data;
  }
}

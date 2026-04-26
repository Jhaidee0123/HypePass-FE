import appConfig from '@/main/config/app-config';
import { AdminAuditLogs, AdminSystemLogs } from '@/domain/usecases';
import {
  RemoteAdminAuditLogs,
  RemoteAdminSystemLogs,
} from '@/data/usecases/remote-admin-audit-logs';

export const makeAdminAuditLogs = (): AdminAuditLogs =>
  new RemoteAdminAuditLogs(appConfig.api.ENDPOINT);

export const makeAdminSystemLogs = (): AdminSystemLogs =>
  new RemoteAdminSystemLogs(appConfig.api.ENDPOINT);

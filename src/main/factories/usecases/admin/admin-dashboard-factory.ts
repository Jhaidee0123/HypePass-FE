import appConfig from '@/main/config/app-config';
import { AdminDashboard } from '@/domain/usecases';
import { RemoteAdminDashboard } from '@/data/usecases/remote-admin-dashboard';

export const makeAdminDashboard = (): AdminDashboard =>
  new RemoteAdminDashboard(appConfig.api.ENDPOINT);

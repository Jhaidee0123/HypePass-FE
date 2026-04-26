import appConfig from '@/main/config/app-config';
import { AdminNotifications } from '@/domain/usecases';
import { RemoteAdminNotifications } from '@/data/usecases/remote-admin-notifications';

export const makeAdminNotifications = (): AdminNotifications =>
  new RemoteAdminNotifications(appConfig.api.ENDPOINT);

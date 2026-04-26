import appConfig from '@/main/config/app-config';
import { AdminEventsMaster, AdminOrders } from '@/domain/usecases';
import { RemoteAdminEventsMaster } from '@/data/usecases/remote-admin-events-master';
import { RemoteAdminOrders } from '@/data/usecases/remote-admin-orders';

export const makeAdminEventsMaster = (): AdminEventsMaster =>
  new RemoteAdminEventsMaster(appConfig.api.ENDPOINT);

export const makeAdminOrders = (): AdminOrders =>
  new RemoteAdminOrders(appConfig.api.ENDPOINT);

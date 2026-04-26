import appConfig from '@/main/config/app-config';
import { AdminUsers } from '@/domain/usecases';
import { RemoteAdminUsers } from '@/data/usecases/remote-admin-users';

export const makeAdminUsers = (): AdminUsers =>
  new RemoteAdminUsers(appConfig.api.ENDPOINT);

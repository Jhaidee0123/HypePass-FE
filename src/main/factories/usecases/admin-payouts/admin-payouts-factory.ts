import appConfig from '@/main/config/app-config';
import { AdminPayouts } from '@/domain/usecases';
import { RemoteAdminPayouts } from '@/data/usecases/remote-admin-payouts';

export const makeAdminPayouts = (): AdminPayouts =>
  new RemoteAdminPayouts(appConfig.api.ENDPOINT);

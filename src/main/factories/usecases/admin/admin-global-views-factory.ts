import appConfig from '@/main/config/app-config';
import { AdminGlobalViews } from '@/domain/usecases';
import { RemoteAdminGlobalViews } from '@/data/usecases/remote-admin-global-views';

export const makeAdminGlobalViews = (): AdminGlobalViews =>
  new RemoteAdminGlobalViews(appConfig.api.ENDPOINT);

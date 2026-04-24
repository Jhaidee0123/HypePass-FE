import appConfig from '@/main/config/app-config';
import { AdminReview } from '@/domain/usecases';
import { RemoteAdminReview } from '@/data/usecases/remote-admin-review';

export const makeAdminReview = (): AdminReview =>
  new RemoteAdminReview(appConfig.api.ENDPOINT);

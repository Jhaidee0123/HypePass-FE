import appConfig from '@/main/config/app-config';
import { Consents } from '@/domain/usecases';
import { RemoteConsents } from '@/data/usecases/remote-consents';

export const makeConsents = (): Consents =>
  new RemoteConsents(appConfig.api.ENDPOINT);

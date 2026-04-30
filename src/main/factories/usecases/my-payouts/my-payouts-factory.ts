import appConfig from '@/main/config/app-config';
import { MyPayouts } from '@/domain/usecases';
import { RemoteMyPayouts } from '@/data/usecases/remote-my-payouts';

export const makeMyPayouts = (): MyPayouts =>
  new RemoteMyPayouts(appConfig.api.ENDPOINT);

import appConfig from '@/main/config/app-config';
import { PayoutMethods } from '@/domain/usecases';
import { RemotePayoutMethods } from '@/data/usecases/remote-payout-methods';

export const makePayoutMethods = (): PayoutMethods =>
  new RemotePayoutMethods(appConfig.api.ENDPOINT);

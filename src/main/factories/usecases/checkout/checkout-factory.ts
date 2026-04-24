import appConfig from '@/main/config/app-config';
import { Checkout } from '@/domain/usecases';
import { RemoteCheckout } from '@/data/usecases/remote-checkout';

export const makeCheckout = (): Checkout =>
  new RemoteCheckout(appConfig.api.ENDPOINT);

import appConfig from '@/main/config/app-config';
import { Marketplace } from '@/domain/usecases';
import { RemoteMarketplace } from '@/data/usecases/remote-marketplace';

export const makeMarketplace = (): Marketplace =>
  new RemoteMarketplace(appConfig.api.ENDPOINT);

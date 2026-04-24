import appConfig from '@/main/config/app-config';
import { Wallet } from '@/domain/usecases';
import { RemoteWallet } from '@/data/usecases/remote-wallet';

export const makeWallet = (): Wallet =>
  new RemoteWallet(appConfig.api.ENDPOINT);

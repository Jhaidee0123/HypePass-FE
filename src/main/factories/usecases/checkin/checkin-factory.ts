import appConfig from '@/main/config/app-config';
import { Checkin } from '@/domain/usecases';
import { RemoteCheckin } from '@/data/usecases/remote-checkin';

export const makeCheckin = (): Checkin =>
  new RemoteCheckin(appConfig.api.ENDPOINT);

import appConfig from '@/main/config/app-config';
import { PublicEvents } from '@/domain/usecases';
import { RemotePublicEvents } from '@/data/usecases/remote-public-events';

export const makePublicEvents = (): PublicEvents =>
  new RemotePublicEvents(appConfig.api.ENDPOINT);

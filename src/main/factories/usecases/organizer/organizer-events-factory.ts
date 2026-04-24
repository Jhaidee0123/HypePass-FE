import appConfig from '@/main/config/app-config';
import { OrganizerEvents } from '@/domain/usecases';
import { RemoteOrganizerEvents } from '@/data/usecases/remote-organizer-events';

export const makeOrganizerEvents = (): OrganizerEvents =>
  new RemoteOrganizerEvents(appConfig.api.ENDPOINT);

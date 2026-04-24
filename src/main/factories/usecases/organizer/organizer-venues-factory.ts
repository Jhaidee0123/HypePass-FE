import appConfig from '@/main/config/app-config';
import { OrganizerVenues } from '@/domain/usecases';
import { RemoteOrganizerVenues } from '@/data/usecases/remote-organizer-venues';

export const makeOrganizerVenues = (): OrganizerVenues =>
  new RemoteOrganizerVenues(appConfig.api.ENDPOINT);

import appConfig from '@/main/config/app-config';
import { OrganizerCategories } from '@/domain/usecases';
import { RemoteOrganizerCategories } from '@/data/usecases/remote-organizer-categories';

export const makeOrganizerCategories = (): OrganizerCategories =>
  new RemoteOrganizerCategories(appConfig.api.ENDPOINT);

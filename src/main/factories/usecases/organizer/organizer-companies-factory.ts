import appConfig from '@/main/config/app-config';
import { OrganizerCompanies } from '@/domain/usecases';
import { RemoteOrganizerCompanies } from '@/data/usecases/remote-organizer-companies';

export const makeOrganizerCompanies = (): OrganizerCompanies =>
  new RemoteOrganizerCompanies(appConfig.api.ENDPOINT);

import appConfig from '@/main/config/app-config';
import { StaffSelf } from '@/domain/usecases';
import { RemoteStaffSelf } from '@/data/usecases/remote-event-staff';

export const makeStaffSelf = (): StaffSelf =>
  new RemoteStaffSelf(appConfig.api.ENDPOINT);

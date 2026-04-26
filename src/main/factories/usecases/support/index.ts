import appConfig from '@/main/config/app-config';
import { AdminSupport, PublicSupport } from '@/domain/usecases';
import {
  RemoteAdminSupport,
  RemotePublicSupport,
} from '@/data/usecases/remote-support';

export const makePublicSupport = (): PublicSupport =>
  new RemotePublicSupport(appConfig.api.ENDPOINT);

export const makeAdminSupport = (): AdminSupport =>
  new RemoteAdminSupport(appConfig.api.ENDPOINT);

import appConfig from '@/main/config/app-config';
import {
  AdminPlatformSettings,
  PublicPlatformStatus,
} from '@/domain/usecases';
import {
  RemoteAdminPlatformSettings,
  RemotePublicPlatformStatus,
} from '@/data/usecases/remote-admin-platform-settings';

export const makeAdminPlatformSettings = (): AdminPlatformSettings =>
  new RemoteAdminPlatformSettings(appConfig.api.ENDPOINT);

export const makePublicPlatformStatus = (): PublicPlatformStatus =>
  new RemotePublicPlatformStatus(appConfig.api.ENDPOINT);

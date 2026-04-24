import appConfig from '@/main/config/app-config';
import { UploadImage } from '@/domain/usecases';
import { RemoteUploadImage } from '@/data/usecases/remote-upload-image';

export const makeUploadImage = (): UploadImage =>
  new RemoteUploadImage(appConfig.api.ENDPOINT);

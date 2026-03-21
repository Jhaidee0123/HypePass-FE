import { RemoteAuthentication } from '@/data/usecases';
import { Authentication } from '@/domain/usecases';

export const makeRemoteAuthentication = (): Authentication => {
  return new RemoteAuthentication();
};

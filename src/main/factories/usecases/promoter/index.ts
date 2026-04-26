import appConfig from '@/main/config/app-config';
import { EventPromoters, PromoterSelf } from '@/domain/usecases';
import {
  RemoteEventPromoters,
  RemotePromoterSelf,
} from '@/data/usecases/remote-event-promoters';

export const makeEventPromoters = (): EventPromoters =>
  new RemoteEventPromoters(appConfig.api.ENDPOINT);

export const makePromoterSelf = (): PromoterSelf =>
  new RemotePromoterSelf(appConfig.api.ENDPOINT);

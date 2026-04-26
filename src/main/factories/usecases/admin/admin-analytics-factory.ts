import appConfig from '@/main/config/app-config';
import { AdminAnalytics, PageViewTracker } from '@/domain/usecases';
import {
  RemoteAdminAnalytics,
  RemotePageViewTracker,
} from '@/data/usecases/remote-analytics';

export const makeAdminAnalytics = (): AdminAnalytics =>
  new RemoteAdminAnalytics(appConfig.api.ENDPOINT);

export const makePageViewTracker = (): PageViewTracker =>
  new RemotePageViewTracker(appConfig.api.ENDPOINT);

export type AnalyticsResponse = {
  range: { from: string; to: string };
  totals: {
    pageViews: number;
    uniqueSessions: number;
    uniqueUsers: number;
  };
  series: Array<{ day: string; views: number; sessions: number }>;
  topPaths: Array<{ path: string; views: number; sessions: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  devices: Array<{ device: string; views: number }>;
};

export interface AdminAnalytics {
  get(days: number): Promise<AnalyticsResponse>;
}

export type TrackPageViewInput = {
  path: string;
  referrer?: string;
  sessionId: string;
  locale?: string;
  device?: string;
};

export interface PageViewTracker {
  track(input: TrackPageViewInput): Promise<void>;
}

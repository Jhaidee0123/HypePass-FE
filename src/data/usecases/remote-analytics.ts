import axios from 'axios';
import {
  AdminAnalytics,
  AnalyticsResponse,
  PageViewTracker,
  TrackPageViewInput,
} from '@/domain/usecases';

export class RemoteAdminAnalytics implements AdminAnalytics {
  constructor(private readonly apiEndpoint: string) {}

  async get(days: number): Promise<AnalyticsResponse> {
    const { data } = await axios.get<AnalyticsResponse>(
      `${this.apiEndpoint}/admin/analytics`,
      { withCredentials: true, params: { days } },
    );
    return data;
  }
}

export class RemotePageViewTracker implements PageViewTracker {
  constructor(private readonly apiEndpoint: string) {}

  async track(input: TrackPageViewInput): Promise<void> {
    try {
      const url = `${this.apiEndpoint}/track`;
      // Try sendBeacon first (fire-and-forget, no blocking nav)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(input)], {
          type: 'application/json',
        });
        const ok = navigator.sendBeacon(url, blob);
        if (ok) return;
      }
      await axios.post(url, input, { withCredentials: true });
    } catch {
      // never throw — analytics must not break the app
    }
  }
}

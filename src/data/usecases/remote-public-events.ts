import axios from 'axios';
import {
  PublicEvents,
  PublicEventsFilters,
} from '@/domain/usecases';
import {
  PublicEventDetail,
  PublicEventListResult,
} from '@/domain/models';

export class RemotePublicEvents implements PublicEvents {
  constructor(private readonly apiEndpoint: string) {}

  async list(
    filters: PublicEventsFilters = {},
  ): Promise<PublicEventListResult> {
    const params = cleanParams(filters);
    const { data } = await axios.get<PublicEventListResult>(
      `${this.apiEndpoint}/public/events`,
      { params },
    );
    return data;
  }

  async getBySlug(slug: string): Promise<PublicEventDetail> {
    const { data } = await axios.get<PublicEventDetail>(
      `${this.apiEndpoint}/public/events/${slug}`,
    );
    return data;
  }
}

function cleanParams(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v;
  }
  return out;
}

import {
  PublicEventDetail,
  PublicEventListResult,
} from '@/domain/models';

export type PublicEventsFilters = {
  city?: string;
  category?: string;
  companyId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: 'soonest' | 'newest' | 'priceAsc' | 'priceDesc';
  page?: number;
  pageSize?: number;
};

export interface PublicEvents {
  list(filters?: PublicEventsFilters): Promise<PublicEventListResult>;
  getBySlug(slug: string): Promise<PublicEventDetail>;
}

import {
  EventMediaModel,
  EventModel,
  EventSessionModel,
  TicketSalePhaseModel,
  TicketSectionModel,
} from './event.model';
import { VenueModel } from './venue.model';
import { CategoryModel } from './category.model';

export type PublicEventListItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  coverImageUrl: string | null;
  bannerImageUrl: string | null;
  category: { id: string; slug: string; name: string } | null;
  venue: {
    id: string;
    name: string;
    city: string;
    country: string;
  } | null;
  nextSessionStartsAt: string | null;
  fromPrice: number | null;
  currency: string;
  onSale: boolean;
  totalSessions: number;
};

export type PublicEventListResult = {
  items: PublicEventListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type PublicEventDetail = {
  event: EventModel;
  category: CategoryModel | null;
  venue: VenueModel | null;
  media?: EventMediaModel[];
  sessions: Array<
    EventSessionModel & {
      sections: Array<
        TicketSectionModel & {
          phases: Array<TicketSalePhaseModel & { isOpenNow: boolean }>;
          currentPhase: TicketSalePhaseModel | null;
        }
      >;
    }
  >;
};

export type EventStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'unpublished'
  | 'cancelled'
  | 'ended';

export type EventSessionStatus =
  | 'scheduled'
  | 'sold_out'
  | 'cancelled'
  | 'ended';

export type TicketSectionStatus = 'active' | 'inactive' | 'sold_out';

export type EventMediaType = 'cover' | 'banner' | 'gallery';

export type EventModel = {
  id: string;
  companyId: string;
  categoryId?: string | null;
  venueId?: string | null;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  status: EventStatus;
  publicationSubmittedAt?: string | null;
  publicationApprovedAt?: string | null;
  publicationRejectedAt?: string | null;
  publicationReviewedBy?: string | null;
  resaleEnabled: boolean;
  transferEnabled: boolean;
  defaultQrVisibleHoursBefore?: number | null;
  currency: string;
  locationName?: string | null;
  locationAddress?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EventSessionModel = {
  id: string;
  eventId: string;
  name?: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  salesStartAt?: string | null;
  salesEndAt?: string | null;
  doorsOpenAt?: string | null;
  checkinStartAt?: string | null;
  transferCutoffAt?: string | null;
  resaleCutoffAt?: string | null;
  qrVisibleFrom?: string | null;
  status: EventSessionStatus;
};

export type TicketSectionModel = {
  id: string;
  eventSessionId: string;
  name: string;
  description?: string | null;
  totalInventory: number;
  minPerOrder: number;
  maxPerOrder: number;
  resaleAllowed: boolean;
  transferAllowed: boolean;
  status: TicketSectionStatus;
  sortOrder: number;
};

export type TicketSalePhaseModel = {
  id: string;
  ticketSectionId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  /** minor units (COP cents). */
  price: number;
  currency: string;
  serviceFee?: number | null;
  platformFee?: number | null;
  taxAmount?: number | null;
  maxPerOrder?: number | null;
  maxPerUser?: number | null;
  sortOrder: number;
  isActive: boolean;
};

export type EventMediaModel = {
  id: string;
  eventId: string;
  url: string;
  publicId?: string | null;
  type: EventMediaType;
  sortOrder: number;
  alt?: string | null;
};

export type EventWithChildren = {
  event: EventModel;
  sessions: Array<
    EventSessionModel & {
      sections: Array<
        TicketSectionModel & { phases: TicketSalePhaseModel[] }
      >;
    }
  >;
  media: EventMediaModel[];
};

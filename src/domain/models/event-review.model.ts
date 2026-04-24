import {
  EventMediaModel,
  EventModel,
  EventSessionModel,
  TicketSalePhaseModel,
  TicketSectionModel,
} from './event.model';

export type EventPublicationReviewStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export type EventPublicationReviewModel = {
  id: string;
  eventId: string;
  submittedByUserId: string;
  reviewedByUserId?: string | null;
  status: EventPublicationReviewStatus;
  reviewNotes?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
};

export type EventForReview = {
  event: EventModel;
  sessions: Array<
    EventSessionModel & {
      sections: Array<
        TicketSectionModel & { phases: TicketSalePhaseModel[] }
      >;
    }
  >;
  media: EventMediaModel[];
  reviews: EventPublicationReviewModel[];
};

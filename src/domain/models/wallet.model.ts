import { TicketModel, TicketStatus } from './ticket.model';

export type WalletTicketView = {
  ticket: TicketModel;
  event: {
    id: string;
    slug: string;
    title: string;
    coverImageUrl: string | null;
    locationName: string | null;
    locationAddress: string | null;
    locationLatitude: number | null;
    locationLongitude: number | null;
  };
  session: {
    id: string;
    name: string | null;
    startsAt: string;
    endsAt: string;
    timezone: string;
    qrVisibleFrom: string;
  };
  section: { id: string; name: string };
  venue: {
    id: string;
    name: string;
    city: string;
    country: string;
  } | null;
  qrVisibleNow: boolean;
  checkedInAt: string | null;
};

export type WalletQrResponse = {
  ticketId: string;
  token: string;
  validUntil: string;
  qrVisibleFrom: string;
};

export { TicketStatus };

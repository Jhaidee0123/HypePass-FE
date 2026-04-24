export type ResaleListingStatus =
  | 'active'
  | 'reserved'
  | 'sold'
  | 'expired'
  | 'cancelled'
  | 'disputed';

export type ResaleListing = {
  id: string;
  ticketId: string;
  sellerUserId: string;
  askPrice: number;
  platformFeeAmount: number;
  sellerNetAmount: number;
  currency: string;
  status: ResaleListingStatus;
  note: string | null;
  reservedByUserId: string | null;
  reservedUntil: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  soldAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicResaleListingView = {
  listing: ResaleListing;
  event: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
  };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
  };
  section: {
    id: string;
    name: string;
  };
  ticketFaceValue: number;
};

export type InitiateResaleCheckoutResponse = {
  orderId: string;
  paymentId: string;
  reference: string;
  amountInCents: number;
  currency: string;
  signature: string;
  publicKey: string;
  customerEmail: string;
  customerFullName: string;
  customerPhone: string;
  customerLegalId: string;
  customerLegalIdType: string;
  reservedUntil: string;
};

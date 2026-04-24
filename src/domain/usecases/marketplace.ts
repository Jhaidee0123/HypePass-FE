import {
  InitiateResaleCheckoutResponse,
  PublicResaleListingView,
  ResaleListing,
} from '@/domain/models';

export type CreateListingParams = {
  ticketId: string;
  askPrice: number;
  note?: string;
};

export type InitiateResaleCheckoutParams = {
  listingId: string;
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerLegalId?: string;
  buyerLegalIdType?: string;
};

export type UpdateListingParams = {
  askPrice?: number;
  note?: string | null;
};

export interface Marketplace {
  listActive(): Promise<PublicResaleListingView[]>;
  getListing(listingId: string): Promise<PublicResaleListingView>;
  listMine(): Promise<ResaleListing[]>;
  createListing(params: CreateListingParams): Promise<ResaleListing>;
  updateListing(
    listingId: string,
    params: UpdateListingParams,
  ): Promise<ResaleListing>;
  cancelListing(listingId: string): Promise<ResaleListing>;
  initiateCheckout(
    params: InitiateResaleCheckoutParams,
  ): Promise<InitiateResaleCheckoutResponse>;
}

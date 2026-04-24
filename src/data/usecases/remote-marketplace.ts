import axios from 'axios';
import {
  CreateListingParams,
  InitiateResaleCheckoutParams,
  Marketplace,
  UpdateListingParams,
} from '@/domain/usecases';
import {
  InitiateResaleCheckoutResponse,
  PublicResaleListingView,
  ResaleListing,
} from '@/domain/models';

export class RemoteMarketplace implements Marketplace {
  constructor(private readonly apiEndpoint: string) {}

  async listActive(): Promise<PublicResaleListingView[]> {
    const { data } = await axios.get<PublicResaleListingView[]>(
      `${this.apiEndpoint}/marketplace/listings`,
      { withCredentials: true },
    );
    return data;
  }

  async getListing(listingId: string): Promise<PublicResaleListingView> {
    const { data } = await axios.get<PublicResaleListingView>(
      `${this.apiEndpoint}/marketplace/listings/${listingId}`,
      { withCredentials: true },
    );
    return data;
  }

  async listMine(): Promise<ResaleListing[]> {
    const { data } = await axios.get<ResaleListing[]>(
      `${this.apiEndpoint}/wallet/listings`,
      { withCredentials: true },
    );
    return data;
  }

  async createListing(params: CreateListingParams): Promise<ResaleListing> {
    const { data } = await axios.post<ResaleListing>(
      `${this.apiEndpoint}/wallet/listings`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async updateListing(
    listingId: string,
    params: UpdateListingParams,
  ): Promise<ResaleListing> {
    const { data } = await axios.patch<ResaleListing>(
      `${this.apiEndpoint}/wallet/listings/${listingId}`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async cancelListing(listingId: string): Promise<ResaleListing> {
    const { data } = await axios.delete<ResaleListing>(
      `${this.apiEndpoint}/wallet/listings/${listingId}`,
      { withCredentials: true },
    );
    return data;
  }

  async initiateCheckout(
    params: InitiateResaleCheckoutParams,
  ): Promise<InitiateResaleCheckoutResponse> {
    const { data } = await axios.post<InitiateResaleCheckoutResponse>(
      `${this.apiEndpoint}/marketplace/checkout/initiate`,
      params,
      { withCredentials: true },
    );
    return data;
  }
}

import { VenueModel } from '../models';

export type CreateVenueParams = {
  name: string;
  addressLine: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  description?: string;
  imageUrl?: string;
};

export interface OrganizerVenues {
  list(companyId: string): Promise<VenueModel[]>;
  create(companyId: string, params: CreateVenueParams): Promise<VenueModel>;
  delete(companyId: string, venueId: string): Promise<void>;
}

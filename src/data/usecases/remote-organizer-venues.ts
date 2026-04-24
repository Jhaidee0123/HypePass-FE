import axios from 'axios';
import {
  CreateVenueParams,
  OrganizerVenues,
} from '@/domain/usecases';
import { VenueModel } from '@/domain/models';

export class RemoteOrganizerVenues implements OrganizerVenues {
  constructor(private readonly apiEndpoint: string) {}

  async list(companyId: string): Promise<VenueModel[]> {
    const { data } = await axios.get<VenueModel[]>(
      `${this.apiEndpoint}/companies/${companyId}/venues`,
      { withCredentials: true },
    );
    return data;
  }

  async create(
    companyId: string,
    params: CreateVenueParams,
  ): Promise<VenueModel> {
    const { data } = await axios.post<VenueModel>(
      `${this.apiEndpoint}/companies/${companyId}/venues`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async delete(companyId: string, venueId: string): Promise<void> {
    await axios.delete(
      `${this.apiEndpoint}/companies/${companyId}/venues/${venueId}`,
      { withCredentials: true },
    );
  }
}

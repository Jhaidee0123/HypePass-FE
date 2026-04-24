import axios from 'axios';
import {
  AddMemberParams,
  CreateCompanyParams,
  OrganizerCompanies,
} from '@/domain/usecases';
import {
  CompanyMembershipModel,
  CompanyModel,
  MyCompanyView,
} from '@/domain/models';

export class RemoteOrganizerCompanies implements OrganizerCompanies {
  constructor(private readonly apiEndpoint: string) {}

  async create(params: CreateCompanyParams): Promise<CompanyModel> {
    const { data } = await axios.post<CompanyModel>(
      `${this.apiEndpoint}/companies`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async listMine(): Promise<MyCompanyView[]> {
    const { data } = await axios.get<MyCompanyView[]>(
      `${this.apiEndpoint}/companies/mine`,
      { withCredentials: true },
    );
    return data;
  }

  async listMembers(companyId: string): Promise<CompanyMembershipModel[]> {
    const { data } = await axios.get<CompanyMembershipModel[]>(
      `${this.apiEndpoint}/companies/${companyId}/members`,
      { withCredentials: true },
    );
    return data;
  }

  async addMember(
    companyId: string,
    params: AddMemberParams,
  ): Promise<CompanyMembershipModel> {
    const { data } = await axios.post<CompanyMembershipModel>(
      `${this.apiEndpoint}/companies/${companyId}/members`,
      params,
      { withCredentials: true },
    );
    return data;
  }
}

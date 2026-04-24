import {
  CompanyMembershipModel,
  CompanyMembershipRole,
  CompanyModel,
  MyCompanyView,
} from '../models';

export type CreateCompanyParams = {
  name: string;
  slug: string;
  legalName?: string;
  taxId?: string;
  contactEmail?: string;
  logoUrl?: string;
};

export type AddMemberParams = {
  email: string;
  role: CompanyMembershipRole;
};

export interface OrganizerCompanies {
  create(params: CreateCompanyParams): Promise<CompanyModel>;
  listMine(): Promise<MyCompanyView[]>;
  listMembers(companyId: string): Promise<CompanyMembershipModel[]>;
  addMember(
    companyId: string,
    params: AddMemberParams,
  ): Promise<CompanyMembershipModel>;
}

export type CompanyStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'suspended';

// Roles de membresía a nivel compañía. `checkin_staff` fue removido — los
// permisos para escanear tickets ahora se asignan por evento vía
// `event_staff_assignments` (ver panel "Staff" en el event editor).
export type CompanyMembershipRole = 'owner' | 'admin' | 'staff';

export type CompanyModel = {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  taxId?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  status: CompanyStatus;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MyCompanyView = {
  company: CompanyModel;
  role: CompanyMembershipRole;
};

export type CompanyMembershipModel = {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyMembershipRole;
  createdAt?: string;
  updatedAt?: string;
};

export type CompanyStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'suspended'
  | 'deleted';

// Roles de membresía a nivel compañía.
// - 'owner':  dueño legal — todo, único que invita miembros y borra eventos.
// - 'admin':  opera el día a día — crea/edita/vende, asigna staff de
//             evento, ve métricas. NO invita miembros, NO borra eventos.
// - 'viewer': solo lectura — ve eventos, ventas y asistentes, no edita
//             nada. (Antes se llamaba 'staff' en la compañía, lo
//             renombramos para no confundirlo con el "Staff del evento"
//             que escanea QR en la puerta.)
//
// El staff que escanea tickets en la puerta NO se asigna aquí — se
// asigna por evento desde `event_staff_assignments`.
export type CompanyMembershipRole = 'owner' | 'admin' | 'viewer';

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
  /** Resolved by the BE — falls back to '(unknown)' when the user is
   *  deleted / scrubbed. */
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

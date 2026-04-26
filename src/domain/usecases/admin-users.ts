export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersListResult = {
  items: AdminUserRow[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminUsersQuery = {
  q?: string;
  role?: 'user' | 'platform_admin';
  banned?: boolean;
  limit?: number;
  offset?: number;
};

export type BanUserInput = {
  reason: string;
  expiresAt?: string;
};

export interface AdminUsers {
  list(query: AdminUsersQuery): Promise<AdminUsersListResult>;
  detail(id: string): Promise<AdminUserRow>;
  setRole(id: string, role: 'user' | 'platform_admin'): Promise<AdminUserRow>;
  ban(id: string, input: BanUserInput): Promise<AdminUserRow>;
  unban(id: string): Promise<AdminUserRow>;
  delete(id: string): Promise<AdminUserRow>;
  sendPasswordReset(id: string): Promise<{ ok: true; email: string }>;
}

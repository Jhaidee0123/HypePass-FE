import axios from 'axios';
import {
  AdminUserRow,
  AdminUsers,
  AdminUsersListResult,
  AdminUsersQuery,
  BanUserInput,
} from '@/domain/usecases';

const stripUndefined = (obj: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) out[k] = v;
  });
  return out;
};

export class RemoteAdminUsers implements AdminUsers {
  constructor(private readonly apiEndpoint: string) {}

  async list(query: AdminUsersQuery): Promise<AdminUsersListResult> {
    const params = stripUndefined({
      ...query,
      banned:
        query.banned === undefined ? undefined : query.banned ? 'true' : 'false',
    });
    const { data } = await axios.get<AdminUsersListResult>(
      `${this.apiEndpoint}/admin/users`,
      { withCredentials: true, params },
    );
    return data;
  }

  async detail(id: string): Promise<AdminUserRow> {
    const { data } = await axios.get<AdminUserRow>(
      `${this.apiEndpoint}/admin/users/${id}`,
      { withCredentials: true },
    );
    return data;
  }

  async setRole(
    id: string,
    role: 'user' | 'platform_admin',
  ): Promise<AdminUserRow> {
    const { data } = await axios.patch<AdminUserRow>(
      `${this.apiEndpoint}/admin/users/${id}/role`,
      { role },
      { withCredentials: true },
    );
    return data;
  }

  async ban(id: string, input: BanUserInput): Promise<AdminUserRow> {
    const { data } = await axios.post<AdminUserRow>(
      `${this.apiEndpoint}/admin/users/${id}/ban`,
      input,
      { withCredentials: true },
    );
    return data;
  }

  async unban(id: string): Promise<AdminUserRow> {
    const { data } = await axios.post<AdminUserRow>(
      `${this.apiEndpoint}/admin/users/${id}/unban`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  async delete(id: string): Promise<AdminUserRow> {
    const { data } = await axios.delete<AdminUserRow>(
      `${this.apiEndpoint}/admin/users/${id}`,
      { withCredentials: true },
    );
    return data;
  }

  async sendPasswordReset(id: string): Promise<{ ok: true; email: string }> {
    const { data } = await axios.post<{ ok: true; email: string }>(
      `${this.apiEndpoint}/admin/users/${id}/send-password-reset`,
      {},
      { withCredentials: true },
    );
    return data;
  }
}

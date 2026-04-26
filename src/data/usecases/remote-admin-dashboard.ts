import axios from 'axios';
import {
  AdminDashboard,
  AdminDashboardResponse,
} from '@/domain/usecases';

export class RemoteAdminDashboard implements AdminDashboard {
  constructor(private readonly apiEndpoint: string) {}

  async get(): Promise<AdminDashboardResponse> {
    const { data } = await axios.get<AdminDashboardResponse>(
      `${this.apiEndpoint}/admin/dashboard`,
      { withCredentials: true },
    );
    return data;
  }
}

import axios from 'axios';
import {
  AdminPlatformSettings,
  PlatformPublicStatus,
  PlatformSettingRow,
  PublicPlatformStatus,
} from '@/domain/usecases';

export class RemoteAdminPlatformSettings implements AdminPlatformSettings {
  constructor(private readonly apiEndpoint: string) {}

  async list(): Promise<PlatformSettingRow[]> {
    const { data } = await axios.get<PlatformSettingRow[]>(
      `${this.apiEndpoint}/admin/platform-settings`,
      { withCredentials: true },
    );
    return data;
  }

  async update(key: string, value: unknown): Promise<PlatformSettingRow> {
    const { data } = await axios.patch<PlatformSettingRow>(
      `${this.apiEndpoint}/admin/platform-settings/${encodeURIComponent(key)}`,
      { value },
      { withCredentials: true },
    );
    return data;
  }
}

export class RemotePublicPlatformStatus implements PublicPlatformStatus {
  constructor(private readonly apiEndpoint: string) {}

  async get(): Promise<PlatformPublicStatus> {
    const { data } = await axios.get<PlatformPublicStatus>(
      `${this.apiEndpoint}/public/platform-status`,
    );
    return data;
  }
}

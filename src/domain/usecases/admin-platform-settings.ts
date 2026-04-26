export type PlatformSettingType = 'boolean' | 'number' | 'string' | 'string_array';

export type PlatformSettingGroup =
  | 'kill_switches'
  | 'commerce'
  | 'qr'
  | 'curation'
  | 'announcements';

export type PlatformSettingRow = {
  key: string;
  type: PlatformSettingType;
  group: PlatformSettingGroup;
  description: string;
  defaultValue: unknown;
  value: unknown;
  updatedByUserId: string | null;
  updatedAt: string;
};

export interface AdminPlatformSettings {
  list(): Promise<PlatformSettingRow[]>;
  update(key: string, value: unknown): Promise<PlatformSettingRow>;
}

export type PlatformPublicStatus = {
  maintenance: { enabled: boolean; message: string };
  signupsEnabled: boolean;
  checkoutEnabled: boolean;
  resaleEnabled: boolean;
};

export interface PublicPlatformStatus {
  get(): Promise<PlatformPublicStatus>;
}

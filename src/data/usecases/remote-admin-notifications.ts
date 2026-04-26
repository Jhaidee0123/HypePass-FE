import axios from 'axios';
import {
  AdminNotificationRow,
  AdminNotifications,
  AdminNotificationsListResult,
} from '@/domain/usecases';

export class RemoteAdminNotifications implements AdminNotifications {
  constructor(private readonly apiEndpoint: string) {}

  async list(unackOnly = false): Promise<AdminNotificationsListResult> {
    const { data } = await axios.get<AdminNotificationsListResult>(
      `${this.apiEndpoint}/admin/notifications`,
      {
        withCredentials: true,
        params: unackOnly ? { unackOnly: 'true' } : undefined,
      },
    );
    return data;
  }

  async ack(id: string): Promise<AdminNotificationRow> {
    const { data } = await axios.patch<AdminNotificationRow>(
      `${this.apiEndpoint}/admin/notifications/${id}/ack`,
      {},
      { withCredentials: true },
    );
    return data;
  }

  async ackAll(): Promise<{ acknowledged: number }> {
    const { data } = await axios.post<{ acknowledged: number }>(
      `${this.apiEndpoint}/admin/notifications/ack-all`,
      {},
      { withCredentials: true },
    );
    return data;
  }
}

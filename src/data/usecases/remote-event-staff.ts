import axios from 'axios';
import { MyStaffEventRow, StaffSelf } from '@/domain/usecases';

export class RemoteStaffSelf implements StaffSelf {
  constructor(private readonly apiEndpoint: string) {}

  async listEvents(): Promise<MyStaffEventRow[]> {
    const { data } = await axios.get<MyStaffEventRow[]>(
      `${this.apiEndpoint}/me/staff/events`,
      { withCredentials: true },
    );
    return data;
  }
}

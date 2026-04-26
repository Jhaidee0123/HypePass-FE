import axios from 'axios';
import {
  AdminGlobalViews,
  CourtesyRow,
  StaffAssignmentRow,
} from '@/domain/usecases';

export class RemoteAdminGlobalViews implements AdminGlobalViews {
  constructor(private readonly apiEndpoint: string) {}

  async listCourtesies(limit = 200): Promise<CourtesyRow[]> {
    const { data } = await axios.get<CourtesyRow[]>(
      `${this.apiEndpoint}/admin/global/courtesies`,
      { withCredentials: true, params: { limit } },
    );
    return data;
  }

  async listStaff(limit = 300): Promise<StaffAssignmentRow[]> {
    const { data } = await axios.get<StaffAssignmentRow[]>(
      `${this.apiEndpoint}/admin/global/staff`,
      { withCredentials: true, params: { limit } },
    );
    return data;
  }
}

import axios from 'axios';
import {
  AdminSupport,
  CreateSupportInput,
  PublicSupport,
  SupportMessageRow,
  SupportTicketDetail,
  SupportTicketKind,
  SupportTicketRow,
  SupportTicketStatus,
} from '@/domain/usecases';

const stripUndefined = (obj: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) out[k] = v;
  });
  return out;
};

export class RemotePublicSupport implements PublicSupport {
  constructor(private readonly apiEndpoint: string) {}

  async open(input: CreateSupportInput): Promise<SupportTicketRow> {
    const { data } = await axios.post<SupportTicketRow>(
      `${this.apiEndpoint}/support/tickets`,
      input,
      { withCredentials: true },
    );
    return data;
  }
}

export class RemoteAdminSupport implements AdminSupport {
  constructor(private readonly apiEndpoint: string) {}

  async list(filter: {
    kind?: SupportTicketKind;
    status?: SupportTicketStatus;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: SupportTicketRow[]; total: number }> {
    const { data } = await axios.get<{
      items: SupportTicketRow[];
      total: number;
    }>(`${this.apiEndpoint}/admin/support/tickets`, {
      withCredentials: true,
      params: stripUndefined(filter as Record<string, unknown>),
    });
    return data;
  }

  async detail(id: string): Promise<SupportTicketDetail> {
    const { data } = await axios.get<SupportTicketDetail>(
      `${this.apiEndpoint}/admin/support/tickets/${id}`,
      { withCredentials: true },
    );
    return data;
  }

  async reply(id: string, body: string): Promise<SupportMessageRow> {
    const { data } = await axios.post<SupportMessageRow>(
      `${this.apiEndpoint}/admin/support/tickets/${id}/reply`,
      { body },
      { withCredentials: true },
    );
    return data;
  }

  async setStatus(
    id: string,
    status: SupportTicketStatus,
  ): Promise<SupportTicketRow> {
    const { data } = await axios.patch<SupportTicketRow>(
      `${this.apiEndpoint}/admin/support/tickets/${id}/status`,
      { status },
      { withCredentials: true },
    );
    return data;
  }
}

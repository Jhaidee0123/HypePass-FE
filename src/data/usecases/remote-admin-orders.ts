import axios from 'axios';
import {
  AdminOrderDetail,
  AdminOrderRow,
  AdminOrders,
  AdminOrdersListResult,
  AdminOrdersQuery,
} from '@/domain/usecases';

const stripUndefined = (obj: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) out[k] = v;
  });
  return out;
};

export class RemoteAdminOrders implements AdminOrders {
  constructor(private readonly apiEndpoint: string) {}

  async list(query: AdminOrdersQuery): Promise<AdminOrdersListResult> {
    const params = stripUndefined({
      ...query,
      needsReconciliation:
        query.needsReconciliation === undefined
          ? undefined
          : query.needsReconciliation
            ? 'true'
            : 'false',
    });
    const { data } = await axios.get<AdminOrdersListResult>(
      `${this.apiEndpoint}/admin/orders`,
      { withCredentials: true, params },
    );
    return data;
  }

  async detail(id: string): Promise<AdminOrderDetail> {
    const { data } = await axios.get<AdminOrderDetail>(
      `${this.apiEndpoint}/admin/orders/${id}`,
      { withCredentials: true },
    );
    return data;
  }

  async markReconciled(id: string): Promise<AdminOrderRow> {
    const { data } = await axios.patch<AdminOrderRow>(
      `${this.apiEndpoint}/admin/orders/${id}/mark-reconciled`,
      {},
      { withCredentials: true },
    );
    return data;
  }
}

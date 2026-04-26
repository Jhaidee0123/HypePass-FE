import React from 'react';
import { Admin } from '@/presentation/pages';
import {
  makeAdminAnalytics,
  makeAdminAuditLogs,
  makeAdminDashboard,
  makeAdminEventsMaster,
  makeAdminGlobalViews,
  makeAdminNotifications,
  makeAdminOrders,
  makeAdminPlatformSettings,
  makeAdminReview,
  makeAdminSystemLogs,
  makeAdminUsers,
} from '@/main/factories/usecases/admin';
import { makeAdminSupport } from '@/main/factories/usecases/support';

export const AdminFactory: React.FC = () => (
  <Admin
    review={makeAdminReview()}
    dashboard={makeAdminDashboard()}
    auditLogs={makeAdminAuditLogs()}
    systemLogs={makeAdminSystemLogs()}
    platformSettings={makeAdminPlatformSettings()}
    users={makeAdminUsers()}
    eventsMaster={makeAdminEventsMaster()}
    orders={makeAdminOrders()}
    analytics={makeAdminAnalytics()}
    globalViews={makeAdminGlobalViews()}
    notifications={makeAdminNotifications()}
    support={makeAdminSupport()}
  />
);

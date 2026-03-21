/**
 * Better Auth Client
 *
 * Creates the auth client that communicates with the backend's Better Auth endpoints.
 * Cookie-based sessions are used (credentials: 'include').
 * The admin plugin enables role-based access control.
 */
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
import appConfig from '@/main/config/app-config';

export const authClient = createAuthClient({
  baseURL: appConfig.api.AUTH_URL,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

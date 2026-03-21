/**
 * Data Use Case: RemoteAuthentication
 *
 * Implements the Authentication interface using Better Auth client.
 * This is the concrete implementation that talks to your auth backend.
 */
import { AccountModel } from '@/domain/models';
import { Authentication } from '@/domain/usecases';
import { authClient } from '@/lib/auth-client';
import appConfig from '@/main/config/app-config';

export class RemoteAuthentication implements Authentication {
  private static toAccountModel(data: any): AccountModel {
    return {
      user: {
        id: data.user?.id ?? '',
        name: data.user?.name ?? '',
        email: data.user?.email ?? '',
        emailVerified: data.user?.emailVerified ?? false,
        role: data.user?.role,
        image: data.user?.image,
        createdAt: data.user?.createdAt,
        updatedAt: data.user?.updatedAt,
      },
      session: {
        id: data.session?.id ?? '',
        token: data.session?.token ?? data.token ?? '',
        expiresAt: data.session?.expiresAt,
      },
    };
  }

  async auth(params: Authentication.Params): Promise<AccountModel> {
    const { data, error } = await authClient.signIn.email({
      email: params.email,
      password: params.password,
    });
    if (error) {
      throw new Error(error.message || 'Login failed');
    }
    if (!data) {
      throw new Error('No response received from server');
    }
    return RemoteAuthentication.toAccountModel(data);
  }

  async signUp(params: Authentication.SignUpParams): Promise<AccountModel> {
    const { data, error } = await authClient.signUp.email({
      name: params.name,
      email: params.email,
      password: params.password,
    });
    if (error) {
      throw new Error(error.message || 'Signup failed');
    }
    if (!data) {
      throw new Error('No response received from server');
    }
    return RemoteAuthentication.toAccountModel(data);
  }

  async signOut(): Promise<void> {
    await authClient.signOut();
  }

  async forgotPassword(params: Authentication.ForgotPasswordParams): Promise<void> {
    const res = await fetch(`${appConfig.api.AUTH_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: params.email,
        redirectTo: `${window.location.origin}/auth-reset-password`,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        throw new Error('No account found with this email');
      }
      throw new Error(data.message || 'Failed to request password reset');
    }
  }

  async resetPassword(params: Authentication.ResetPasswordParams): Promise<void> {
    const res = await fetch(`${appConfig.api.AUTH_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        token: params.token,
        newPassword: params.newPassword,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to reset password');
    }
  }
}

export namespace RemoteAuthentication {
  export type Model = Authentication.Model;
}

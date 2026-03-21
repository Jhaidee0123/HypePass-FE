/**
 * Domain Use Case: Authentication
 *
 * Defines the contract for authentication operations.
 * The domain layer only declares interfaces — implementations live in the data layer.
 */
import { AccountModel } from '@/domain/models';

export interface Authentication {
  auth(params: Authentication.Params): Promise<Authentication.Model>;
  signUp(params: Authentication.SignUpParams): Promise<Authentication.Model>;
  signOut(): Promise<void>;
  forgotPassword(params: Authentication.ForgotPasswordParams): Promise<void>;
  resetPassword(params: Authentication.ResetPasswordParams): Promise<void>;
}

export namespace Authentication {
  export type Params = {
    email: string;
    password: string;
  };

  export type SignUpParams = {
    name: string;
    email: string;
    password: string;
  };

  export type ForgotPasswordParams = {
    email: string;
  };

  export type ResetPasswordParams = {
    token: string;
    newPassword: string;
  };

  export type Model = AccountModel;
}

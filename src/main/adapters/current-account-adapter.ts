/**
 * Adapters: CurrentAccountAdapter
 *
 * Bridge between Recoil state and localStorage persistence.
 * When the user logs in, the account is saved to localStorage.
 * On page reload, it's restored from localStorage into Recoil.
 */
import { AccountModel } from '@/domain/models';
import { makeLocalStorageAdapter } from '@/main/factories/cache';

export const setCurrentAccountAdapter = (account: AccountModel): void => {
  makeLocalStorageAdapter().set('account', account);
};

export const getCurrentAccountAdapter = (): AccountModel => {
  return makeLocalStorageAdapter().get('account');
};

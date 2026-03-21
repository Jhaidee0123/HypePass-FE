/**
 * Global Recoil Atoms
 *
 * currentAccountState: Holds the current user session + adapters for get/set.
 * loginFlowUserState: Temporary state for multi-step auth flows (e.g., confirm signup).
 */
import { AccountModel } from '@/domain/models';
import { atom } from 'recoil';

export const currentAccountState = atom({
  key: 'currentAccountState',
  default: {
    getCurrentAccount: null as () => AccountModel,
    setCurrentAccount: null as (account: AccountModel) => void
  }
});

export const loginFlowUserState = atom({
  key: 'loginFlowUserState',
  default: null,
  dangerouslyAllowMutability: true
});

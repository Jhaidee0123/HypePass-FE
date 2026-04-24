import { atom } from 'recoil';
export const currentAccountState = atom({
    key: 'currentAccountState',
    default: {
        getCurrentAccount: null,
        setCurrentAccount: null
    }
});
export const loginFlowUserState = atom({
    key: 'loginFlowUserState',
    default: null,
    dangerouslyAllowMutability: true
});

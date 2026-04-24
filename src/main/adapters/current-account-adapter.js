import { makeLocalStorageAdapter } from "../factories/cache";
export const setCurrentAccountAdapter = (account) => {
    makeLocalStorageAdapter().set('account', account);
};
export const getCurrentAccountAdapter = () => {
    return makeLocalStorageAdapter().get('account');
};

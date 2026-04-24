import { LocalStorageAdapter } from "../../../infra/cache/local-storage-adapter";
export const makeLocalStorageAdapter = () => {
    return new LocalStorageAdapter();
};

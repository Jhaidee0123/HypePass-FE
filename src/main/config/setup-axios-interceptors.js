/**
 * Axios Interceptors
 *
 * Global response interceptor that handles 401 (unauthorized) responses
 * by clearing the stored account and redirecting to login.
 */
import axios from 'axios';
import { makeLocalStorageAdapter } from "../factories/cache";
export const setupAxiosInterceptors = () => {
    axios.interceptors.response.use((response) => response, (error) => {
        var _a;
        if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            makeLocalStorageAdapter().set('account', undefined);
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    });
};

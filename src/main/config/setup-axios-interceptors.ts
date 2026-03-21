/**
 * Axios Interceptors
 *
 * Global response interceptor that handles 401 (unauthorized) responses
 * by clearing the stored account and redirecting to login.
 */
import axios from 'axios';
import { makeLocalStorageAdapter } from '@/main/factories/cache';

export const setupAxiosInterceptors = (): void => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        makeLocalStorageAdapter().set('account', undefined);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );
};

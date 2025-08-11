import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '@/utils/auth/token';

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

export const setupRequestInterceptor = (api: AxiosInstance) => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      const tokens = tokenStore.get();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export const setupResponseInterceptor = (api: AxiosInstance) => {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });
      const status = error.response?.status;

      // Handle 401 Unauthorized - Token refresh
      if (status === 401 && !original?._retry) {
        original._retry = true;

        if (isRefreshing) {
          // Wait for the ongoing refresh to complete
          await new Promise<void>((resolve) => pendingQueue.push(resolve));
          return api(original);
        }

        try {
          isRefreshing = true;
          
          // Attempt to refresh token
          await api.post('/auth/refresh', undefined, { 
            withCredentials: true,
            // Don't retry refresh requests
            _retry: true 
          } as any);
          
          // Resolve all pending requests
          pendingQueue.forEach((resolve) => resolve());
          pendingQueue = [];
          
          // Retry original request
          return api(original);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          tokenStore.clear();
          localStorage.removeItem('user');
          
          // Clear pending queue
          pendingQueue = [];
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export const setupInterceptors = (api: AxiosInstance) => {
  setupRequestInterceptor(api);
  setupResponseInterceptor(api);
};

import type { AxiosInstance } from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '@/utils/auth/token';

// Singleton promise to prevent multiple simultaneous refresh token calls
let refreshTokenPromise: Promise<string> | null = null;

export function attachInterceptors(api: AxiosInstance) {
  api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error?.config;
      const status = error?.response?.status;

      if (status === 401 && !original.__isRetry) {
        original.__isRetry = true;
        const rt = getRefreshToken();

        if (rt) {
          try {
            // Use singleton promise pattern to ensure only 1 refresh call
            if (!refreshTokenPromise) {
              refreshTokenPromise = (async () => {
                try {
                  const refreshRes = await api.post('/api/v1/auth/refresh-token', null, {
                    headers: { Authorization: `Bearer ${rt}` },
                  });
                  const data = refreshRes?.data?.data ?? refreshRes?.data;
                  const newAT = data?.accessToken ?? data?.access_token;
                  const newRT = data?.refreshToken ?? data?.refresh_token;

                  if (newAT) setAccessToken(newAT);
                  if (newRT) setRefreshToken(newRT);

                  return newAT;
                } finally {
                  // Reset promise after completion (success or failure)
                  refreshTokenPromise = null;
                }
              })();
            }

            // All pending requests wait for the same refresh promise
            const newAccessToken = await refreshTokenPromise;

            // Retry original request with new token
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(original);
          } catch (refreshError) {
            // Refresh token failed - clear tokens and redirect to login
            clearTokens();

            // Redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }

            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available - redirect to login
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }

      return Promise.reject(error);
    }
  );
}

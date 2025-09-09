import type { AxiosInstance } from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '@/utils/auth/token';

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
            const refreshRes = await api.post('/api/v1/auth/refresh-token', null, {
              headers: { Authorization: `Bearer ${rt}` },
            });
            const data = refreshRes?.data?.data ?? refreshRes?.data;
            const newAT = data?.accessToken ?? data?.access_token;
            const newRT = data?.refreshToken ?? data?.refresh_token;
            if (newAT) setAccessToken(newAT);
            if (newRT) setRefreshToken(newRT);
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newAT}`;
            return api(original);
          } catch (_e) {
            clearTokens();
          }
        }
      }

      return Promise.reject(error);
    }
  );
}

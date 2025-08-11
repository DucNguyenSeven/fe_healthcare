import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15000,
});

// (tuỳ chọn) request interceptor: có thể attach accessToken từ in-memory store nếu backend chưa set cookie
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });
    const status = error.response?.status;

    if (status === 401 && !original?._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingQueue.push(resolve));
        return api(original);
      }

      try {
        isRefreshing = true;
        await api.post('/auth/refresh', undefined, { withCredentials: true });
        pendingQueue.forEach((r) => r());
        pendingQueue = [];
        return api(original);
      } catch (e) {
        pendingQueue = [];
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export { api };
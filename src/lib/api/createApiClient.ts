import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { setupInterceptors } from './interceptors';

export interface ApiClientConfig extends CreateAxiosDefaults {
  enableInterceptors?: boolean;
}

export const createApiClient = (config: ApiClientConfig): AxiosInstance => {
  const { enableInterceptors = true, ...axiosConfig } = config;

  // Create axios instance with default config
  const api = axios.create({
    timeout: 15000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...axiosConfig,
  });

  // Setup interceptors if enabled
  if (enableInterceptors) {
    setupInterceptors(api);
  }

  return api;
};

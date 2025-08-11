import { createApiClient } from './createApiClient';

// Create main API client with full configuration
const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  enableInterceptors: true,
});

export { api };
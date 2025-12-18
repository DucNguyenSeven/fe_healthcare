import axios from 'axios';
import { snakeToCamel } from '@/utils/caseConverter';

const aiServiceURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000);

/**
 * Creates axios client for direct connection to AI Service (port 8086)
 * This bypasses the Gateway for AI prediction endpoints
 *
 * Response Transformer:
 * - Automatically converts snake_case keys from Python backend to camelCase for TypeScript
 * - Handles nested objects and arrays recursively
 */
export function createAIClient() {
  const instance = axios.create({
    baseURL: aiServiceURL,
    timeout,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
  });

  // Add response interceptor to convert snake_case → camelCase
  instance.interceptors.response.use(
    (response) => {
      // Transform response data from snake_case (Python) to camelCase (TypeScript)
      if (response.data && typeof response.data === 'object') {
        response.data = snakeToCamel(response.data);
      }
      return response;
    },
    (error) => {
      // Also transform error response data if exists
      if (error.response?.data && typeof error.response.data === 'object') {
        error.response.data = snakeToCamel(error.response.data);
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000);

export function createApiClient() {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: { Accept: 'application/json' },
  });
  return instance;
}

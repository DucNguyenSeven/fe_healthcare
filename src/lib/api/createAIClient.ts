import axios from 'axios';

const aiServiceURL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8086';
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000);

/**
 * Creates axios client for direct connection to AI Service (port 8086)
 * This bypasses the Gateway for AI prediction endpoints
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
  return instance;
}

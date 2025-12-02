import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8080';
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000);

export function createChatClient() {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: { Accept: 'application/json' },
  });
  return instance;
}

// Chat service API client
// Base URL can be configured via env
// Base URL from .env.local; single source of truth
const CHAT_BASE_URL = process.env.NEXT_PUBLIC_CHATBOT_BASE_URL || 'http://localhost:8086';

export type ChatRequest = {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  model?: string;
};

export type ChatResponse = {
  text: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Chat API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function health(): Promise<{ status: string } | any> {
  const res = await fetch(`${CHAT_BASE_URL}/health`, { headers: { accept: 'application/json' } });
  return handleResponse(res);
}

export async function chat(payload: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${CHAT_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<ChatResponse>(res);
}

export async function chatStream(payload: ChatRequest): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${CHAT_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Chat stream error ${res.status}: ${text || res.statusText}`);
  }
  return res.body;
}

export default { health, chat, chatStream };
// Centralized RAG (Retrieval-Augmented Generation) API client
// Follow workspace rule: all FE->BE API calls live under lib/api/{feature}

export type RagAskRequest = {
  question: string;
};

export type RagSource = {
  file: string;
  page?: number;
  content_preview?: string;
};

export type RagAskResponse = {
  question: string;
  answer: string;
  sources?: RagSource[];
  num_sources?: number;
};

const RAG_BASE_URL = process.env.NEXT_PUBLIC_RAG_BASE_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`RAG API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function askRag(payload: RagAskRequest): Promise<RagAskResponse> {
  const res = await fetch(`${RAG_BASE_URL}/api/v1/rag/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<RagAskResponse>(res);
}

export async function rebuildRagIndex(): Promise<{ status: string } | any> {
  const res = await fetch(`${RAG_BASE_URL}/api/v1/rag/rebuild`, {
    method: 'POST',
    headers: { accept: 'application/json' }
  });
  return handleResponse(res);
}

export async function getRagStatus(): Promise<{ status: string } | any> {
  const res = await fetch(`${RAG_BASE_URL}/api/v1/rag/status`, {
    method: 'GET',
    headers: { accept: 'application/json' }
  });
  return handleResponse(res);
}

export default {
  askRag,
  rebuildRagIndex,
  getRagStatus
};



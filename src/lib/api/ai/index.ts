/**
 * AI Chat Service API
 * Gọi qua Gateway để nhất quán với mobile app
 * Backend endpoint: POST /api/v1/chat/ask
 */

import { getAccessToken } from '@/utils/auth/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface AskAIRequest {
  group_id: string;
  message: string;
  user_id: string;
}

export interface AskAIResponse {
  response: string;
}

/**
 * Gọi AI API để nhận response
 * Endpoint: POST /api/v1/chat/ask
 *
 * @param request - Request chứa group_id, message, user_id
 * @returns Response chứa AI response text
 */
export async function askAI(request: AskAIRequest): Promise<AskAIResponse> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    throw new Error(`AI API error ${response.status}: ${error || response.statusText}`);
  }

  return response.json();
}

export default { askAI };

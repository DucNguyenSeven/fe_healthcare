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
  const url = `${API_BASE_URL}/api/v1/chat/ask`;

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('❌ [AI-API] HTTP error!', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`AI API error ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error('❌ [AI-API] ========== AI API CALL FAILED ==========');
    console.error('❌ [AI-API] Error after', elapsed, 'ms');
    console.error('❌ [AI-API] Error type:', error?.name);
    console.error('❌ [AI-API] Error message:', error?.message);

    if (error?.message?.includes('Failed to fetch')) {
      console.error('❌ [AI-API] Network error - check if AI service is running');
    }

    console.error('❌ [AI-API] Full error:', error);
    console.error('🌐 [AI-API] ========== END AI API CALL (ERROR) ==========\n');

    throw error;
  }
}

export default { askAI };

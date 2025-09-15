import api from '../client';
import { ChatRequest, ChatResponse, MessageResponse } from '../types';

export const ChatApi = {
  // Gửi câu hỏi tới AI assistant
  ask: (payload: ChatRequest) => 
    api.post<MessageResponse<ChatResponse>>('/api/chat/ask', payload)
      .then(res => res.data),
};

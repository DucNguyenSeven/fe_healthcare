import { useState } from 'react';
// import { postChat } from '../lib/api/chat'; // Comment out real API call

export type ChatMessage = { 
  id: string;
  role: "user" | "ai"; 
  content: string;
  timestamp: Date;
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setMessages([]);
  };

  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user", 
      content: question.trim(),
      timestamp: new Date()
    };
    
    setMessages((m) => [...m, userMessage]);
    setLoading(true);
    
    try {
      // Mock API response instead of real API call
      const mockResponse = await new Promise<{ answer: string }>(resolve => {
        setTimeout(() => {
          resolve({
            answer: `Đây là câu trả lời mẫu cho câu hỏi: "${question}". Hiện tại backend chưa sẵn sàng, vui lòng thử lại sau.`
          });
        }, 1500);
      });
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai", 
        content: mockResponse.answer,
        timestamp: new Date()
      };
      setMessages((m) => [...m, aiMessage]);
    } catch (error) {
      // Chat API error
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai", 
        content: "Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        timestamp: new Date()
      };
      setMessages((m) => [...m, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendQuestion, clearMessages };
} 
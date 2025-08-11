import { useState } from 'react';
import { postChat } from '../lib/api/chat';

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
      // Ensure minimum display time for typing indicator
      const [apiResult] = await Promise.all([
        postChat(question),
        new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5 second delay for better UX
      ]);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai", 
        content: apiResult.answer,
        timestamp: new Date()
      };
      setMessages((m) => [...m, aiMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
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
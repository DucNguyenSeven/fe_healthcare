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
      const { answer } = await postChat(question);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai", 
        content: answer,
        timestamp: new Date()
      };
      setMessages((m) => [...m, aiMessage]);
    } catch (e) {
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

  return { messages, loading, sendQuestion };
} 
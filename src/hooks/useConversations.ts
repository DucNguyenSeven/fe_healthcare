import { useState } from 'react';

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>("1");

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Cuộc trò chuyện mới",
      updatedAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    
    return newConversation.id;
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(conversations[0]?.id || null);
    }
  };

  const updateConversationTitle = (id: string, title: string) => {
    setConversations((prev) => 
      prev.map(conv => 
        conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
      )
    );
  };

  return {
    conversations,
    currentConversationId,
    createNewConversation,
    selectConversation,
    deleteConversation,
    updateConversationTitle
  };
}

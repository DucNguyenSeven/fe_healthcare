// Chat related types
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  sender: {
    id: string;
    name: string;
    role: 'user' | 'assistant' | 'system';
  };
  timestamp: string;
  isEdited?: boolean;
  editedAt?: string;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  unreadCount: number;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  type?: Message['type'];
  metadata?: Message['metadata'];
}

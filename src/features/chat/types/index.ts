// Chat widget specific types
export interface ChatUser {
  id: string
  name: string
  avatar: string
  role: 'doctor' | 'patient'
  specialty?: string // for doctors
  isOnline?: boolean
  lastSeen?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'file'
  isRead: boolean
  metadata?: {
    fileName?: string
    fileSize?: number
    imageUrl?: string
  }
}

export interface ChatConversation {
  id: string
  participants: ChatUser[]
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
  updatedAt: string
  isTyping?: boolean
  typingUser?: string
}

export interface ChatWidgetState {
  isOpen: boolean
  activeConversationId: string | null
  conversations: ChatConversation[]
  currentUser: ChatUser | null
  isLoading: boolean
}

export type ChatWidgetView = 'collapsed' | 'conversations' | 'chat'
'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import {
  getUserGroups,
  getGroupMessages,
  sendMessage,
  createGroup,
  joinGroup,
  addMessageHandler,
  removeMessageHandler,
  connect,
  disconnect,
  getConnectionStatus
} from '@/lib/api/communication';
import type {
  Group,
  Message,
  WebSocketResponse
} from '@/lib/api/communication';
import type { ChatMember } from '@/services/websocket-chat';
import { ChatConversation, ChatMessage, ChatUser } from '@/features/chat/types';

// ============ State Types ============

interface WebSocketChatState {
  // Connection
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isLoading: boolean;
  error: string | null;

  // Chat Data
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>; // groupId -> messages
  activeConversationId: string | null;

  // UI State
  unreadCounts: Record<string, number>; // groupId -> count
  typingUsers: Record<string, string[]>; // groupId -> userIds
}

type WebSocketChatAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: WebSocketChatState['connectionStatus'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Group[] }
  | { type: 'ADD_CONVERSATION'; payload: Group }
  | { type: 'SET_MESSAGES'; payload: { groupId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: { groupId: string; count: number } }
  | { type: 'SET_TYPING_USERS'; payload: { groupId: string; userIds: string[] } };

// ============ Helper Functions ============

function mapGroupToConversation(group: Group, currentUserId: string): ChatConversation {
  // Find other participants (exclude current user)
  const otherParticipants = group.members.filter(member => member.userId !== currentUserId);

  const participants: ChatUser[] = otherParticipants.map(member => ({
    id: member.userId,
    name: member.fullName,
    avatar: member.avatarUrl,
    role: 'doctor', // TODO: Get actual role from backend
    isOnline: true  // TODO: Get actual online status
  }));

  const lastMessage: ChatMessage | undefined = group.lastMessageContent ? {
    id: `last-${group.groupId}`,
    conversationId: group.groupId,
    senderId: 'unknown', // TODO: Get actual sender ID
    content: group.lastMessageContent,
    timestamp: group.timeLastMessage || group.updatedAt,
    type: 'text',
    isRead: true
  } : undefined;

  return {
    id: group.groupId,
    participants,
    lastMessage,
    unreadCount: 0, // Will be updated separately
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    isTyping: false
  };
}

function mapMessageToChatMessage(message: Message): ChatMessage {
  return {
    id: message.messageId,
    conversationId: message.groupId,
    senderId: message.senderId,
    content: message.content,
    timestamp: message.sendAt,
    type: 'text',
    isRead: true // TODO: Handle read status from backend
  };
}

// ============ Reducer ============

function webSocketChatReducer(state: WebSocketChatState, action: WebSocketChatAction): WebSocketChatState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload.map(group =>
          mapGroupToConversation(group, state.activeConversationId || '')
        )
      };

    case 'ADD_CONVERSATION': {
      const newConversation = mapGroupToConversation(action.payload, state.activeConversationId || '');
      return {
        ...state,
        conversations: [newConversation, ...state.conversations]
      };
    }

    case 'SET_MESSAGES': {
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.groupId]: action.payload.messages.map(mapMessageToChatMessage)
        }
      };
    }

    case 'ADD_MESSAGE': {
      const message = mapMessageToChatMessage(action.payload);
      const existingMessages = state.messages[action.payload.groupId] || [];

      // Check if message already exists to avoid duplicates
      const messageExists = existingMessages.some(m => m.id === message.id);
      if (messageExists) return state;

      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.groupId]: [...existingMessages, message]
        },
        // Update last message in conversation
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.groupId
            ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
            : conv
        )
      };
    }

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.groupId]: action.payload.count
        },
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.groupId
            ? { ...conv, unreadCount: action.payload.count }
            : conv
        )
      };

    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.groupId]: action.payload.userIds
        }
      };

    default:
      return state;
  }
}

// ============ Context ============

interface WebSocketChatContextType extends WebSocketChatState {
  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (groupId: string) => Promise<void>;
  sendChatMessage: (groupId: string, content: string) => Promise<void>;
  createNewConversation: (members: ChatMember[], appointmentId?: string) => Promise<string>;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (groupId: string) => void;
  joinConversation: (groupId: string) => Promise<void>;

  // Utilities
  reconnect: () => Promise<void>;
  clearError: () => void;
}

const WebSocketChatContext = createContext<WebSocketChatContextType | null>(null);

// ============ Provider ============

interface WebSocketChatProviderProps {
  children: ReactNode;
}

export function WebSocketChatProvider({ children }: WebSocketChatProviderProps) {
  const { user, isAuthenticated } = useAuthContext();

  const [state, dispatch] = useReducer(webSocketChatReducer, {
    connectionStatus: 'disconnected',
    isLoading: false,
    error: null,
    conversations: [],
    messages: {},
    activeConversationId: null,
    unreadCounts: {},
    typingUsers: {}
  });

  // Ref to avoid circular dependency
  const loadConversationsRef = useRef<(() => Promise<void>) | null>(null);

  // ============ WebSocket Message Handler ============

  const handleWebSocketMessage = useCallback((response: WebSocketResponse) => {

    switch (response.action) {
      case 'groups':
        dispatch({ type: 'SET_CONVERSATIONS', payload: response.data });
        break;

      case 'messages':
        if (state.activeConversationId) {
          dispatch({
            type: 'SET_MESSAGES',
            payload: {
              groupId: state.activeConversationId,
              messages: response.data
            }
          });
        }
        break;

      case 'group_created':
        dispatch({ type: 'ADD_CONVERSATION', payload: response.data });
        break;

      case 'message_received':
        dispatch({ type: 'ADD_MESSAGE', payload: response.data });

        // Update unread count if not active conversation
        if (response.data.groupId !== state.activeConversationId) {
          const currentCount = state.unreadCounts[response.data.groupId] || 0;
          dispatch({
            type: 'UPDATE_UNREAD_COUNT',
            payload: {
              groupId: response.data.groupId,
              count: currentCount + 1
            }
          });
        }
        break;

      case 'error':
        dispatch({ type: 'SET_ERROR', payload: response.data });
        break;

      case 'connection':
        break;

      case 'welcome':
      case 'hello':
        if (user && loadConversationsRef.current) {
          loadConversationsRef.current();
        }
        break;

      default:
        break;
    }
  }, [state.activeConversationId, state.unreadCounts, user]);

  // ============ Actions (Moved before Effects) ============

  const markAsRead = useCallback((groupId: string) => {
    dispatch({ type: 'UPDATE_UNREAD_COUNT', payload: { groupId, count: 0 } });
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const groups = await getUserGroups(user.userId);
      dispatch({ type: 'SET_CONVERSATIONS', payload: groups });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách cuộc trò chuyện' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const loadMessages = useCallback(async (groupId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await getGroupMessages(groupId);
      dispatch({ type: 'SET_MESSAGES', payload: { groupId, messages } });
    } catch (error) {
      console.error('Failed to load messages:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải tin nhắn' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const sendChatMessage = useCallback(async (groupId: string, content: string) => {
    if (!user || !groupId || !content.trim()) {
      return;
    }

    try {
      await sendMessage(groupId, user.userId, content);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể gửi tin nhắn' });
    }
  }, [user]);

  const createNewConversation = useCallback(async (
    members: ChatMember[],
    appointmentId?: string
  ): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const group = await createGroup(members, appointmentId);
      // Group will be added via WebSocket response
      return group.groupId;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tạo cuộc trò chuyện' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });

    // Mark as read when opening conversation
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [markAsRead]);

  const joinConversation = useCallback(async (groupId: string) => {
    try {
      await joinGroup(groupId);
      await loadMessages(groupId);
      setActiveConversation(groupId);
    } catch (error) {
      console.error('Failed to join conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tham gia cuộc trò chuyện' });
    }
  }, [loadMessages, setActiveConversation]);

  const reconnect = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
      await connect();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Reconnection failed:', error);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
      dispatch({ type: 'SET_ERROR', payload: 'Không thể kết nối lại' });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Update ref when loadConversations changes
  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  // ============ Effects ============

  // Setup WebSocket connection and message handler
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      return;
    }

    // Connection initialization flag to prevent race conditions
    let isInitializing = true;

    const initializeConnection = async () => {
      try {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });

        await connect();

        if (!isInitializing) {
          return;
        }

        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      } catch (error) {
        if (isInitializing) {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
          dispatch({ type: 'SET_ERROR', payload: 'Không thể kết nối đến server chat' });
        }
      }
    };

    // Add message handler first
    addMessageHandler(handleWebSocketMessage);

    // Initialize connection with small delay to avoid rapid re-connections
    const connectionTimeout = setTimeout(() => {
      if (isInitializing) {
        initializeConnection();
      }
    }, 100);

    return () => {
      isInitializing = false;
      clearTimeout(connectionTimeout);
      removeMessageHandler(handleWebSocketMessage);

      setTimeout(() => {
        disconnect();
      }, 50);
    };
  }, [isAuthenticated, user?.userId]); // Only depend on userId to prevent unnecessary re-connections

  // Note: Conversations are now loaded via welcome message handler
  // This ensures proper handshake completion before sending requests

  // Monitor connection status with reduced frequency
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      const status = getConnectionStatus();
      if (status !== state.connectionStatus) {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [state.connectionStatus, isAuthenticated, user]);

  // ============ Context Value ============

  const contextValue: WebSocketChatContextType = {
    ...state,
    loadConversations,
    loadMessages,
    sendChatMessage,
    createNewConversation,
    setActiveConversation,
    markAsRead,
    joinConversation,
    reconnect,
    clearError
  };

  return (
    <WebSocketChatContext.Provider value={contextValue}>
      {children}
    </WebSocketChatContext.Provider>
  );
}

// ============ Hook ============

export function useWebSocketChat() {
  const context = useContext(WebSocketChatContext);
  if (!context) {
    throw new Error('useWebSocketChat must be used within a WebSocketChatProvider');
  }
  return context;
}

export default WebSocketChatContext;
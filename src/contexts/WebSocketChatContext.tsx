'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { toast } from 'sonner';
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
  getConnectionStatus,
  sendMessageViaREST,
  getGroupMessagesViaREST,
  getUserGroupsViaREST
} from '@/lib/api/communication';
import type {
  Group,
  Message,
  WebSocketResponse
} from '@/lib/api/communication';
import type { ChatMember } from '@/services/websocket-chat';
import webSocketChatService from '@/services/websocket-chat';
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
  isJoiningGroup: boolean; // Track if currently joining a group to prevent race conditions

  // AI Chat
  currentAIGroupId: string | null; // Track AI group for chatbot
  isAIResponding: boolean; // Track if AI is processing request
}

type WebSocketChatAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: WebSocketChatState['connectionStatus'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Group }
  | { type: 'SET_MESSAGES'; payload: { groupId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: Message & { currentUserId?: string } }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: { groupId: string; count: number } }
  | { type: 'SET_TYPING_USERS'; payload: { groupId: string; userIds: string[] } }
  | { type: 'SET_JOINING_GROUP'; payload: boolean }
  | { type: 'SET_AI_GROUP'; payload: string | null }
  | { type: 'SET_AI_RESPONDING'; payload: boolean };

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

  const conversation = {
    id: group.groupId,
    participants,
    lastMessage,
    unreadCount: 0, // Will be updated separately
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    isTyping: false
  };

  return conversation;
}

// Helper function to check if a group is an AI group
function isAIGroup(group: Group): boolean {
  // Check if groupId ends with "-AI"
  if (group.groupId.endsWith('-AI')) {
    return true;
  }

  // Check if any member has userId === "AI"
  if (group.members.some(member => member.userId === 'AI')) {
    return true;
  }

  return false;
}

function mapMessageToChatMessage(message: any): ChatMessage {
  // Defensive mapping - handle both camelCase and snake_case
  // Priority: camelCase (from DTO) > snake_case (from DB)
  const mapped: ChatMessage = {
    id: message.messageId || message.message_id || message._id || `fallback-${Date.now()}`,
    conversationId: message.groupId || message.group_id,
    senderId: message.senderId || message.sender_id,
    content: message.content || '',
    timestamp: message.sendAt || message.send_at || message.createdAt || message.created_at || new Date().toISOString(),
    type: 'text',
    isRead: message.isRead !== undefined ? message.isRead : (message.is_read !== undefined ? message.is_read : true)
  };

  // Validate required fields
  if (!mapped.senderId || !mapped.id || mapped.id.startsWith('fallback-')) {
    console.error('Invalid message data:', message);
  }

  return mapped;
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
        conversations: action.payload // Already mapped in loadConversations
      };

    case 'ADD_CONVERSATION': {
      // Note: This action is deprecated in favor of calling loadConversations after group creation
      // But keeping for compatibility with WebSocket messages
      return state; // Don't modify state, rely on loadConversations instead
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
      const tempMessageId = action.payload.tempMessageId;
      const currentUserId = action.payload.currentUserId;

      // Validate required fields
      if (!message.senderId || !message.id) {
        console.error('[Reducer] Invalid message, missing required fields:', {
          senderId: message.senderId,
          messageId: message.id
        });
        return state; // Skip invalid messages
      }

      // Check if message already exists to avoid duplicates (by messageId)
      const messageExists = existingMessages.some(m => m.id === message.id);
      if (messageExists) {
        return state;
      }

      let updatedMessages = [...existingMessages];

      // Strategy 1: Replace by tempMessageId (100% accurate)
      if (tempMessageId) {
        const optimisticIndex = updatedMessages.findIndex(m => m.id === tempMessageId);
        if (optimisticIndex !== -1) {
          updatedMessages = updatedMessages.filter((_, i) => i !== optimisticIndex);
        }
      }
      // Strategy 2: Fallback - content matching (for broadcasts without tempId)
      else if (!message.id.startsWith('temp-')) {
        const now = new Date(message.timestamp).getTime();
        const optimisticIndex = updatedMessages.findIndex(m => {
          if (!m.id.startsWith('temp-')) return false;
          if (m.senderId !== message.senderId) return false;
          if (m.content.trim().toLowerCase() !== message.content.trim().toLowerCase()) return false;

          // Check time proximity (within 30 seconds)
          const msgTime = new Date(m.timestamp).getTime();
          const timeDiff = Math.abs(now - msgTime);
          if (timeDiff > 30000) return false;

          return true;
        });

        if (optimisticIndex !== -1) {
          updatedMessages = updatedMessages.filter((_, i) => i !== optimisticIndex);
        }
      }

      updatedMessages.push(message);

      // Check if message is from another user and not in active conversation
      const isFromOtherUser = currentUserId && message.senderId !== currentUserId;
      const isNotActiveConversation = action.payload.groupId !== state.activeConversationId;
      const shouldIncrementUnread = isFromOtherUser && isNotActiveConversation;

      // Update unread count if needed
      let newUnreadCounts = state.unreadCounts;
      if (shouldIncrementUnread) {
        const currentCount = state.unreadCounts[action.payload.groupId] || 0;
        newUnreadCounts = {
          ...state.unreadCounts,
          [action.payload.groupId]: currentCount + 1
        };
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.groupId]: updatedMessages
        },
        unreadCounts: newUnreadCounts,
        // Update last message and unread count in conversation
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.groupId
            ? {
              ...conv,
              lastMessage: message,
              updatedAt: message.timestamp,
              unreadCount: shouldIncrementUnread
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount
            }
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

    case 'SET_JOINING_GROUP':
      return { ...state, isJoiningGroup: action.payload };

    case 'SET_AI_GROUP':
      return { ...state, currentAIGroupId: action.payload };

    case 'SET_AI_RESPONDING':
      return { ...state, isAIResponding: action.payload };

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
  createNewConversation: (members: ChatMember[], appointmentId?: string, customGroupName?: string) => Promise<{ groupId: string; isExistingGroup: boolean }>;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (groupId: string) => void;
  joinConversation: (groupId: string) => Promise<void>;

  // AI Chat Actions
  initializeAIGroup: () => Promise<string>;
  sendAIMessage: (content: string) => Promise<void>;

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
    typingUsers: {},
    isJoiningGroup: false,
    currentAIGroupId: null,
    isAIResponding: false
  });

  // Ref to avoid circular dependency
  const loadConversationsRef = useRef<(() => Promise<void>) | null>(null);

  // Ref to track activeConversationId in real-time (avoid stale closure)
  const activeConversationIdRef = useRef<string | null>(null);

  // Ref to track messages that have already shown toast (avoid duplicate toasts)
  const shownToastMessagesRef = useRef<Set<string>>(new Set());

  // ============ WebSocket Message Handler ============

  const handleWebSocketMessage = useCallback((response: WebSocketResponse) => {
    switch (response.action) {
      case 'authenticate':
      case 'authenticated':
        // Authentication successful, now we can load conversations
        if (response.status === 'success' || response.status === 'ok') {
          // Load conversations after successful authentication
          if (user && loadConversationsRef.current) {
            loadConversationsRef.current();
          }
        }
        break;

      case 'message_received': {
        const message = response.data;
        console.log('📨 [WS-RECV] ========== RECEIVED MESSAGE ==========');
        console.log('📨 [WS-RECV] Message details:', {
          messageId: message.messageId,
          senderId: message.senderId,
          groupId: message.groupId,
          messageType: message.messageType,
          contentLength: message.content?.length,
          timestamp: message.sendAt || message.createdAt
        });
        console.log('📨 [WS-RECV] Content preview:', message.content?.substring(0, 100));

        if (message.senderId === 'AI') {
          console.log('🤖 [WS-RECV] *** AI MESSAGE RECEIVED! ***');
        }

        dispatch({ type: 'ADD_MESSAGE', payload: { ...message, currentUserId: user?.userId } });
        console.log('✅ [WS-RECV] Message added to state');
        console.log('📨 [WS-RECV] =====================================\n');

        // Check if message is from another user (not from current user)
        const isFromOtherUser = user && message.senderId !== user.userId;
        // Use ref to get real-time activeConversationId (avoid stale closure)
        const isNotActiveConversation = message.groupId !== activeConversationIdRef.current;

        // Show notification if:
        // 1. Message from other user (not self)
        // 2. Not in active conversation (not currently viewing)
        // 3. Toast not already shown for this message (avoid duplicates)
        if (isFromOtherUser && isNotActiveConversation) {
          // Check if toast already shown for this message ID
          if (!shownToastMessagesRef.current.has(message.messageId)) {
            // Mark message as toast shown
            shownToastMessagesRef.current.add(message.messageId);

            // Auto cleanup after 1 minute to prevent memory leak
            setTimeout(() => {
              shownToastMessagesRef.current.delete(message.messageId);
            }, 60000);

            // Show toast notification with message content
            const truncatedContent = message.content.length > 60
              ? message.content.substring(0, 60) + '...'
              : message.content;

            // Determine sender role for notification description
            const isCurrentUserDoctor = user?.role === 'DOCTOR';
            const notificationDescription = isCurrentUserDoctor
              ? 'Tin nhắn mới từ Bệnh nhân'
              : 'Tin nhắn mới từ Bác sĩ';

            toast.info(truncatedContent, {
              description: notificationDescription,
              duration: 5000,
              action: {
                label: 'Xem',
                onClick: () => {
                  dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: message.groupId });
                }
              }
            });
          }
        }
        break;
      }

      case 'group_created': {
        const newGroup = response.data;

        // Check if current user is a member of this new group
        const isMember = newGroup.members?.some((m: any) => m.userId === user?.userId);

        if (isMember) {
          // Reload conversations to show new group
          if (loadConversationsRef.current) {
            loadConversationsRef.current();
          }

          // Join group via WebSocket to receive real-time messages
          // Wait a bit to ensure backend processing completes
          if (webSocketChatService.isReady()) {
            webSocketChatService.joinGroup(newGroup.groupId);

            // Small delay to ensure join completes before allowing messages
            setTimeout(() => {
              // Join delay completed
            }, 200);
          }

          // Show notification only for doctors (patients don't need this notification)
          // Patients already get "Tạo cuộc trò chuyện thành công" from AppointmentsPage
          const isDoctor = user?.role === 'DOCTOR';

          if (isDoctor) {
            // Get other participant name for notification
            const otherParticipant = newGroup.members?.find((m: any) => m.userId !== user?.userId);
            const participantName = otherParticipant?.fullName || 'Người dùng';

            toast.info('Cuộc trò chuyện mới', {
              description: `Bệnh nhân ${participantName} đã bắt đầu cuộc trò chuyện với bạn`,
              duration: 5000,
              action: {
                label: 'Xem',
                onClick: () => {
                  dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: newGroup.groupId });
                }
              }
            });
          }
        }
        break;
      }

      case 'connection':
      case 'welcome':
      case 'hello':
        // ✅ FIX: Welcome message is now optional (for backward compatibility)
        // Authentication is already called proactively after connection
        console.log('📨 [WebSocketChat] Received welcome message (authentication already sent)');
        break;

      case 'schedule_appointment_response':
        // Forward appointment events - handled by WebSocketAppointmentContext
        // No action needed here, just pass through
        break;

      case 'join_group':
      case 'messages':
      case 'groups':
      case 'error':
      default:
        // Silent handling
        break;
    }
  }, [state.unreadCounts, state.conversations, user]);

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

      // Use REST API instead of WebSocket
      const groups = await getUserGroupsViaREST(user.userId);

      // Filter out AI groups before mapping to conversations
      const nonAIGroups = groups.filter(group => !isAIGroup(group));

      // Map groups to conversations with current user context
      const conversations = nonAIGroups.map(group => mapGroupToConversation(group, user.userId));

      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error) {
      console.error('Failed to load conversations via REST API:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách cuộc trò chuyện' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const loadMessages = useCallback(async (groupId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // ✅ MOBILE-COMPATIBLE: Use WebSocket get_messages event instead of REST
      console.log('[loadMessages] 🚀 Loading messages via WebSocket (Mobile-compatible)');

      if (!webSocketChatService.isReady()) {
        console.warn('[loadMessages] ⚠️ WebSocket not ready, waiting...');

        const maxWait = 10000;
        const startTime = Date.now();

        while (!webSocketChatService.isReady() && (Date.now() - startTime) < maxWait) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!webSocketChatService.isReady()) {
          throw new Error('WebSocket not ready - cannot load messages');
        }
      }

      // Send get_messages event via WebSocket
      const messagesPromise = new Promise<Message[]>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Get messages timeout'));
        }, 10000);

        const handler = (response: WebSocketResponse) => {
          if (response.action === 'messages' && response.data?.groupId === groupId) {
            clearTimeout(timeout);
            webSocketChatService.removeMessageHandler(handler);

            const messages = Array.isArray(response.data.messages) ? response.data.messages : [];
            console.log('[loadMessages] ✅ Received', messages.length, 'messages via WebSocket');
            resolve(messages);
          }
        };

        webSocketChatService.addMessageHandler(handler);
        webSocketChatService.getMessages({ groupId, page: 0, size: 100 });
        console.log('[loadMessages] 📤 Sent get_messages event for group:', groupId);
      });

      const messages = await messagesPromise;
      dispatch({ type: 'SET_MESSAGES', payload: { groupId, messages } });

    } catch (error: any) {
      console.error('[loadMessages] ❌ Failed to load messages via WebSocket:', error);

      // For new groups with no messages, don't show error - just set empty messages
      if (error?.message?.includes('404') || error?.message?.includes('not found') || error?.message?.includes('No messages') || error?.message?.includes('timeout')) {
        dispatch({ type: 'SET_MESSAGES', payload: { groupId, messages: [] } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Không thể tải tin nhắn' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const sendChatMessage = useCallback(async (groupId: string, content: string) => {
    if (!user || !groupId || !content.trim()) {
      return;
    }

    // Generate unique tempMessageId
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    try {
      // Always create optimistic message first for immediate UI feedback
      const optimisticMessage: Message = {
        messageId: tempId,
        groupId,
        senderId: user.userId,
        content: content.trim(),
        sendAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { ...optimisticMessage, currentUserId: user.userId } });

      // Try WebSocket first, fallback to REST
      if (webSocketChatService.isReady()) {
        webSocketChatService.sendChatMessage({
          groupId,
          senderId: user.userId,
          content: content.trim(),
          messageType: 'TEXT',
          tempMessageId: tempId
        });
      } else {
        const message = await sendMessageViaREST(groupId, user.userId, content, 'TEXT', tempId);
        dispatch({ type: 'ADD_MESSAGE', payload: { ...message, currentUserId: user.userId } });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể gửi tin nhắn' });
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  }, [user]);

  const createNewConversation = useCallback(async (
    members: ChatMember[],
    appointmentId?: string,
    customGroupName?: string
  ): Promise<{ groupId: string; isExistingGroup: boolean }> => {
    if (!user?.userId) {
      throw new Error('User not found');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Use REST API creation (backend will return new group or existing group if duplicate)
      const actualGroup = await createGroup(members, appointmentId, customGroupName);

      // Refresh all conversations to get the actual one
      if (user?.userId) {
        await loadConversations();
      }

      // Set active conversation to update UI immediately
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: actualGroup.groupId });

      // Load messages for the group
      let isExistingGroup = false;
      try {
        const messages = await getGroupMessagesViaREST(actualGroup.groupId);
        isExistingGroup = messages.length > 0;
        dispatch({ type: 'SET_MESSAGES', payload: { groupId: actualGroup.groupId, messages } });
      } catch (messageError: any) {
        isExistingGroup = false;
        dispatch({ type: 'SET_MESSAGES', payload: { groupId: actualGroup.groupId, messages: [] } });
      }

      // Join group via WebSocket for real-time updates with joining state
      if (webSocketChatService.isReady()) {
        dispatch({ type: 'SET_JOINING_GROUP', payload: true });

        webSocketChatService.joinGroup(actualGroup.groupId);

        // Wait for join to complete (small delay to ensure backend processing)
        await new Promise(resolve => setTimeout(resolve, 300));

        dispatch({ type: 'SET_JOINING_GROUP', payload: false });
      }

      // Mark as read
      dispatch({ type: 'UPDATE_UNREAD_COUNT', payload: { groupId: actualGroup.groupId, count: 0 } });

      return { groupId: actualGroup.groupId, isExistingGroup };
    } catch (error) {
      console.error('Failed to create conversation:', error);

      // Remove optimistic conversation on error by refreshing
      if (user?.userId) {
        await loadConversations();
      }

      dispatch({ type: 'SET_ERROR', payload: 'Không thể tạo cuộc trò chuyện' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_JOINING_GROUP', payload: false });
    }
  }, [user, loadConversations]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });

    // Mark as read when opening conversation
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [markAsRead]);

  const joinConversation = useCallback(async (groupId: string) => {
    try {
      // Set active conversation first to update UI immediately
      setActiveConversation(groupId);

      // Load messages using REST API
      try {
        const messages = await getGroupMessagesViaREST(groupId);
        dispatch({ type: 'SET_MESSAGES', payload: { groupId, messages } });
      } catch (messageError: any) {
        dispatch({ type: 'SET_MESSAGES', payload: { groupId, messages: [] } });
      }

      // Join group via WebSocket for real-time updates
      if (webSocketChatService.isReady()) {
        webSocketChatService.joinGroup(groupId);
      }
    } catch (error) {
      console.error('Failed to join conversation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tham gia cuộc trò chuyện' });
      toast.error('Không thể tham gia cuộc trò chuyện');
    }
  }, [setActiveConversation]);

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

  // ============ AI Chat Methods ============

  // Storage key for AI group
  const AI_GROUP_STORAGE_KEY = 'healthcare_ai_group_id';

  /**
   * Initialize AI Group (tự động tạo hoặc load từ storage)
   * Lazy initialization - chỉ gọi khi user gửi message đầu tiên
   * MOBILE-COMPATIBLE: Ensures WebSocket is ready before operations
   */
  const initializeAIGroup = useCallback(async (): Promise<string> => {
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }

    // ✅ Ensure WebSocket is ready before proceeding (Mobile-compatible)
    console.log('[AI-GROUP] 🔍 Checking WebSocket status...');
    if (!webSocketChatService.isReady()) {
      console.log('[AI-GROUP] ⏳ Waiting for WebSocket to be ready...');

      const maxWait = 10000;
      const startTime = Date.now();

      while (!webSocketChatService.isReady() && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (!webSocketChatService.isReady()) {
        const error = new Error('WebSocket not ready - cannot initialize AI group');
        console.error('[AI-GROUP] ❌', error);
        throw error;
      }

      console.log('[AI-GROUP] ✅ WebSocket ready!');
    }

    // 1. Check localStorage first
    const storedGroupId = localStorage.getItem(AI_GROUP_STORAGE_KEY);

    if (storedGroupId) {
      // Verify group exists by loading conversations
      await loadConversations();
      const groupExists = state.conversations.some(conv => conv.id === storedGroupId);

      if (groupExists) {
        dispatch({ type: 'SET_AI_GROUP', payload: storedGroupId });

        // Load messages for this group
        try {
          await loadMessages(storedGroupId);
        } catch (error) {
          console.error('Failed to load AI group messages:', error);
        }

        // Re-join group to receive AI broadcasts
        console.log('🚪 [AI-GROUP] Re-joining existing AI group:', storedGroupId);
        webSocketChatService.joinGroup(storedGroupId);
        console.log('✅ [AI-GROUP] Join command sent for group:', storedGroupId);

        return storedGroupId;
      }
    }

    // 2. Create new AI group
    const aiGroupName = `AI Chat - ${Date.now()}`;
    const members: ChatMember[] = [
      {
        userId: user.userId,
        fullName: user.fullName || user.name || user.email,
        avatarUrl: user.avatarUrl || user.avatar || ''
      },
      {
        userId: 'AI',
        fullName: 'Trợ lý AI',
        avatarUrl: ''
      }
    ];

    const { groupId } = await createNewConversation(members, undefined, aiGroupName);

    // 3. Save to localStorage and state
    localStorage.setItem(AI_GROUP_STORAGE_KEY, groupId);
    dispatch({ type: 'SET_AI_GROUP', payload: groupId });

    // Ensure joined (safety check in case createNewConversation didn't join)
    console.log('🚪 [AI-GROUP] Ensuring join for new AI group:', groupId);
    webSocketChatService.joinGroup(groupId);
    console.log('✅ [AI-GROUP] Join command sent, waiting 200ms...');
    // Small delay to ensure join completes
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('✅ [AI-GROUP] Join wait completed');

    return groupId;
  }, [user, state.conversations, loadConversations, loadMessages, createNewConversation]);

  /**
   * Send message to AI and handle response
   * Flow: User message → WebSocket → AI API → AI response → WebSocket
   */
  const sendAIMessage = useCallback(async (content: string) => {
    console.log('🤖 [AI-CHAT] ========== START AI MESSAGE FLOW ==========');
    console.log('🤖 [AI-CHAT] User input:', content?.trim());

    if (!user?.userId || !content.trim()) {
      console.error('❌ [AI-CHAT] Missing userId or content');
      return;
    }

    try {
      // 1. Ensure AI group exists (lazy initialization)
      let aiGroupId = state.currentAIGroupId;
      console.log('📋 [AI-CHAT] Current AI group ID:', aiGroupId);

      if (!aiGroupId) {
        console.log('🔄 [AI-CHAT] No AI group found, initializing...');
        aiGroupId = await initializeAIGroup();
        console.log('✅ [AI-CHAT] AI group initialized:', aiGroupId);
      }

      // 2. Send user message via WebSocket (optimistic update already handled in sendChatMessage)
      console.log('📤 [AI-CHAT] Sending user message to group:', aiGroupId);
      await sendChatMessage(aiGroupId, content.trim());
      console.log('✅ [AI-CHAT] User message sent');

      // 3. Set AI responding state
      dispatch({ type: 'SET_AI_RESPONDING', payload: true });
      console.log('⏳ [AI-CHAT] AI responding state set to true');

      // 4. Import and call AI API to get response
      console.log('📞 [AI-CHAT] Calling AI API...');
      console.log('📞 [AI-CHAT] Request:', {
        group_id: aiGroupId,
        user_id: user.userId,
        message_length: content.trim().length
      });

      const { askAI } = await import('@/lib/api/ai');
      const aiResponse = await askAI({
        group_id: aiGroupId,
        message: content.trim(),
        user_id: user.userId
      });

      console.log('✅ [AI-CHAT] AI API response received');
      console.log('📄 [AI-CHAT] Response length:', aiResponse.response.length);
      console.log('📄 [AI-CHAT] Response preview:', aiResponse.response.substring(0, 100));

      // 5. Generate tempMessageId for AI response
      const aiTempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      console.log('🆔 [AI-CHAT] Generated temp ID for AI message:', aiTempId);

      // 6. Send AI response via WebSocket
      console.log('🔌 [AI-CHAT] WebSocket ready?', webSocketChatService.isReady());

      if (webSocketChatService.isReady()) {
        // Ensure we're joined to this group before sending AI response
        console.log('🚪 [AI-CHAT] Ensuring joined to group before sending:', aiGroupId);
        webSocketChatService.joinGroup(aiGroupId);

        console.log('📤 [AI-CHAT] Sending AI response via WebSocket:', {
          groupId: aiGroupId,
          senderId: 'AI',
          contentLength: aiResponse.response.length,
          tempMessageId: aiTempId
        });

        webSocketChatService.sendChatMessage({
          groupId: aiGroupId,
          senderId: 'AI',
          content: aiResponse.response,
          messageType: 'TEXT',
          tempMessageId: aiTempId
        });

        console.log('✅ [AI-CHAT] AI response sent via WebSocket');
        console.log('⏳ [AI-CHAT] Waiting for message_received event...');
      } else {
        console.warn('⚠️ [AI-CHAT] WebSocket not ready, using fallback');
        // Fallback: Add directly to state if WebSocket not ready
        const aiMessage: Message = {
          messageId: aiTempId,
          groupId: aiGroupId,
          senderId: 'AI',
          content: aiResponse.response,
          sendAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_MESSAGE', payload: { ...aiMessage, currentUserId: user.userId } });
        console.log('✅ [AI-CHAT] AI message added directly to state (fallback)');
      }

    } catch (error) {
      console.error('❌ [AI-CHAT] Error in AI message flow:', error);
      console.error('❌ [AI-CHAT] Error details:', {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
        stack: (error as Error)?.stack
      });
      dispatch({ type: 'SET_ERROR', payload: 'Không thể gửi tin nhắn đến AI' });
      toast.error('Không thể kết nối đến AI. Vui lòng thử lại.');
    } finally {
      dispatch({ type: 'SET_AI_RESPONDING', payload: false });
      console.log('🤖 [AI-CHAT] ========== END AI MESSAGE FLOW ==========\n');
    }
  }, [user, state.currentAIGroupId, initializeAIGroup, sendChatMessage]);

  // Update ref when loadConversations changes
  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  // Sync activeConversationId with ref for real-time access in callbacks
  useEffect(() => {
    activeConversationIdRef.current = state.activeConversationId;
  }, [state.activeConversationId]);

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

        // ✅ FIX: Authenticate immediately after connection (like mobile app)
        // Don't wait for 'welcome' message - proactively authenticate
        if (user?.userId) {
          console.log('🔐 [WebSocketChat] Authenticating user immediately:', user.userId);
          webSocketChatService.authenticate(user.userId);
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

  // Auto-load conversations removed - now triggered by authenticate response
  // See handleWebSocketMessage case 'authenticate' for the new flow

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
    initializeAIGroup,
    sendAIMessage,
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
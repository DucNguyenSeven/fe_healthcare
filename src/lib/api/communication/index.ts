/**
 * Communication API using WebSocket
 * Provides Promise-based interface over WebSocket Chat Service
 */

import webSocketChatService, {
  type CreateGroupData,
  type SendMessageData,
  type ChatMember
} from '@/services/websocket-chat';

// Re-export WebSocketResponse for context usage
export type { WebSocketResponse } from '@/services/websocket-chat';

// ============ Types ============

export interface Group {
  groupId: string;
  groupName: string;
  appointmentId?: string;
  lastMessageContent?: string;
  timeLastMessage?: string;
  members: ChatMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  messageId: string;
  groupId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  sendAt: string;
  createdAt: string;
  tempMessageId?: string;  // For optimistic update tracking
}

export interface CommunicationApiError {
  action: string;
  status: 'error';
  data: string;
}

// ============ Helper Functions ============

/**
 * Creates a Promise that resolves when a specific WebSocket response is received
 */
function waitForResponse<T = any>(
  expectedAction: string,
  timeout: number = 10000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      webSocketChatService.removeMessageHandler(handler);
      reject(new Error(`Timeout waiting for ${expectedAction} response`));
    }, timeout);

    const handler = (response: any) => {
      if (response.action === expectedAction) {
        clearTimeout(timeoutId);
        webSocketChatService.removeMessageHandler(handler);

        if (response.status === 'error') {
          reject(new Error(response.data));
        } else {
          resolve(response.data);
        }
      }
    };

    webSocketChatService.addMessageHandler(handler);
  });
}

/**
 * Ensures WebSocket connection before making API calls
 */
async function ensureConnection(): Promise<void> {
  if (!webSocketChatService.isConnected()) {
    await webSocketChatService.connect();
  }
}

/**
 * Auto-generates group name based on existing groups count
 */
function generateGroupName(existingGroups: Group[]): string {
  const nextNumber = existingGroups.length + 1;
  return `Cuộc trò chuyện ${nextNumber}`;
}

// ============ API Functions ============

/**
 * Get all groups for a user using REST API only (optimized for reliability)
 */
export async function getUserGroups(userId: string, page: number = 0, size: number = 20): Promise<Group[]> {
  // Use REST API directly for better reliability
  return await getUserGroupsViaREST(userId, page, size);
}

/**
 * Create a new group using REST API fallback
 */
export async function createGroupViaREST(
  members: ChatMember[],
  appointmentId?: string,
  customGroupName?: string
): Promise<Group> {
  // Get existing groups to generate name if not provided
  let groupName = customGroupName;
  if (!groupName) {
    try {
      const existingGroups = await getUserGroups(members[0]?.userId);
      groupName = generateGroupName(existingGroups);
    } catch (error) {
      // Fallback if we can't get existing groups
      groupName = `Cuộc trò chuyện ${Date.now()}`;
    }
  }

  const createData = {
    groupName,
    members,
    ...(appointmentId && { appointmentId })
  };


  const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/api/communication/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const result = await response.json();

  // Map backend GroupResponse to frontend Group format
  if (result && result.groupId) {
    const mappedGroup: Group = {
      groupId: result.groupId,
      groupName: result.groupName,
      appointmentId: result.appointmentId,
      lastMessageContent: result.lastMessageContent || null,
      timeLastMessage: result.timeLastMessage || null,
      members: result.members || [],
      createdAt: result.createdAt || new Date().toISOString(),
      updatedAt: result.updatedAt || new Date().toISOString()
    };

    return mappedGroup;
  } else {
    throw new Error('Invalid response format from backend');
  }
}

/**
 * Create a new group using REST API only (optimized for speed)
 */
export async function createGroup(
  members: ChatMember[],
  appointmentId?: string,
  customGroupName?: string
): Promise<Group> {
  // Get existing groups to generate name if not provided
  let groupName = customGroupName;
  if (!groupName) {
    try {
      // Use REST API to get existing groups for name generation
      const existingGroups = await getUserGroupsViaREST(members[0]?.userId);
      groupName = generateGroupName(existingGroups);
    } catch (error) {
      // Fallback if we can't get existing groups
      groupName = `Cuộc trò chuyện ${Date.now()}`;
    }
  }

  return await createGroupViaREST(members, appointmentId, groupName);
}


/**
 * Send a message to a group
 */
export async function sendMessage(
  groupId: string,
  senderId: string,
  content: string,
  messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
): Promise<Message> {
  await ensureConnection();

  const messageData: SendMessageData = {
    groupId,
    senderId,
    content,
    messageType
  };

  const responsePromise = waitForResponse<Message>('message_received');
  webSocketChatService.sendChatMessage(messageData);

  return responsePromise;
}

/**
 * Get messages for a specific group
 */
export async function getGroupMessages(
  groupId: string,
  page: number = 0,
  size: number = 20
): Promise<Message[]> {
  await ensureConnection();

  const responsePromise = waitForResponse<Message[]>('messages');
  webSocketChatService.getMessages({ groupId, page, size });

  return responsePromise;
}

/**
 * Join a group
 */
export async function joinGroup(groupId: string): Promise<string> {
  await ensureConnection();

  const responsePromise = waitForResponse<string>('join_group');
  webSocketChatService.joinGroup(groupId);

  return responsePromise;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string): Promise<string> {
  await ensureConnection();

  const responsePromise = waitForResponse<string>('leave_group');
  webSocketChatService.leaveGroup(groupId);

  return responsePromise;
}

/**
 * Get WebSocket connection status
 */
export function getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
  return webSocketChatService.getStatus();
}

/**
 * Connect to WebSocket (if not already connected)
 */
export async function connect(): Promise<void> {
  return webSocketChatService.connect();
}

/**
 * Authenticate user with WebSocket server
 * Must be called after connection is established
 */
export function authenticate(userId: string): void {
  webSocketChatService.authenticate(userId);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return webSocketChatService.isUserAuthenticated();
}

/**
 * Disconnect from WebSocket
 */
export function disconnect(): void {
  webSocketChatService.disconnect();
}

/**
 * Add a message handler for real-time updates
 */
export function addMessageHandler(handler: (response: any) => void): void {
  webSocketChatService.addMessageHandler(handler);
}

/**
 * Remove a message handler
 */
export function removeMessageHandler(handler: (response: any) => void): void {
  webSocketChatService.removeMessageHandler(handler);
}

// ============ REST API Functions (No WebSocket) ============

/**
 * Send message via REST API (no WebSocket dependency)
 */
export async function sendMessageViaREST(
  groupId: string,
  senderId: string,
  content: string,
  messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
  tempMessageId?: string
): Promise<Message> {
  console.log('[sendMessageViaREST] Sending message:', {
    groupId,
    senderId,
    content: content.substring(0, 30),
    tempMessageId
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/api/communication/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      groupId,
      senderId,
      content,
      messageType,
      tempMessageId  // Include tempMessageId in request
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[sendMessageViaREST] Failed:', response.status, errorText);
    throw new Error(`Failed to send message: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('[sendMessageViaREST] Success:', result.messageId, 'tempId:', result.tempMessageId);
  return result;
}

/**
 * Get group messages via REST API (no WebSocket dependency)
 */
export async function getGroupMessagesViaREST(
  groupId: string,
  page: number = 0,
  size: number = 20
): Promise<Message[]> {
  const query = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/api/communication/groups/${groupId}/messages?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );

  if (!response.ok) {
    // Handle 404 for empty groups gracefully
    if (response.status === 404) {
      return [];
    }
    const errorText = await response.text();
    throw new Error(`Failed to get messages: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return Array.isArray(result) ? result : [];
}

/**
 * Get user groups via REST API (no WebSocket dependency)
 */
export async function getUserGroupsViaREST(
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<Group[]> {

  const query = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE_URL}/api/communication/users/${userId}/groups?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user groups: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  return Array.isArray(result) ? result : [];
}

// Legacy compatibility exports
export { getUserGroups as getConversationsByUserId };
export { getGroupMessages as getMessagesByConversationId };
export { createGroup as createConversation };
export { sendMessage as sendChatMessage };

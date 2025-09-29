/**
 * Communication API using WebSocket
 * Provides Promise-based interface over WebSocket Chat Service
 */

import webSocketChatService, {
  type WebSocketResponse,
  type CreateGroupData,
  type SendMessageData,
  type ChatMember
} from '@/services/websocket-chat';

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

    const handler = (response: WebSocketResponse) => {
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
 * Get all groups for a user
 */
export async function getUserGroups(userId: string, page: number = 0, size: number = 20): Promise<Group[]> {
  await ensureConnection();

  const responsePromise = waitForResponse<Group[]>('groups');
  webSocketChatService.getUserGroups({ userId, page, size });

  return responsePromise;
}

/**
 * Create a new group with auto-generated name
 */
export async function createGroup(
  members: ChatMember[],
  appointmentId?: string,
  customGroupName?: string
): Promise<Group> {
  await ensureConnection();

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

  const createData: CreateGroupData = {
    groupName,
    members,
    ...(appointmentId && { appointmentId })
  };

  const responsePromise = waitForResponse<Group>('group_created');
  webSocketChatService.createGroup(createData);

  return responsePromise;
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
 * Disconnect from WebSocket
 */
export function disconnect(): void {
  webSocketChatService.disconnect();
}

/**
 * Add a message handler for real-time updates
 */
export function addMessageHandler(handler: (response: WebSocketResponse) => void): void {
  webSocketChatService.addMessageHandler(handler);
}

/**
 * Remove a message handler
 */
export function removeMessageHandler(handler: (response: WebSocketResponse) => void): void {
  webSocketChatService.removeMessageHandler(handler);
}

// Legacy compatibility exports
export { getUserGroups as getConversationsByUserId };
export { getGroupMessages as getMessagesByConversationId };
export { createGroup as createConversation };
export { sendMessage as sendChatMessage };

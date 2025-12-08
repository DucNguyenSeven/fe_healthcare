/**
 * Communication API using WebSocket
 * Provides Promise-based interface over WebSocket Chat Service
 */

import webSocketChatService, {
  type CreateGroupData,
  type SendMessageData,
  type ChatMember,
} from "@/services/websocket-chat";
import chatApi from "@/lib/api/chatClient";

// Re-export WebSocketResponse for context usage
export type { WebSocketResponse } from "@/services/websocket-chat";

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
  tempMessageId?: string; // For optimistic update tracking
}

export interface CommunicationApiError {
  action: string;
  status: "error";
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

        if (response.status === "error") {
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
 * Waits for WebSocket to be ready (connected and authenticated)
 * Mobile-compatible: ensures WebSocket is ready before operations
 */
async function waitForWebSocketReady(timeout: number = 5000): Promise<void> {
  console.log("[waitForWebSocketReady] Waiting for WebSocket to be ready...");
  const startTime = Date.now();

  while (!webSocketChatService.isReady()) {
    if (Date.now() - startTime > timeout) {
      const error = new Error(`WebSocket not ready after ${timeout}ms timeout`);
      console.error("[waitForWebSocketReady] Timeout:", error);
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("[waitForWebSocketReady] WebSocket is ready!");
}

/**
 * Auto-generates group name based on existing groups count
 */
function generateGroupName(existingGroups: Group[]): string {
  const nextNumber = existingGroups.length + 1;
  return `Cuộc trò chuyện ${nextNumber}`;
}

/**
 * Tìm existing group theo member IDs sử dụng API mới từ backend
 * API: POST /api/communication/groups/find-by-members
 * @param memberIds - Danh sách user IDs của members
 * @returns Group nếu tìm thấy, null nếu không tìm thấy
 */
async function findGroupByMembersViaAPI(
  memberIds: string[]
): Promise<Group | null> {
  try {
    const response = await chatApi.post<Group>(
      "/api/communication/groups/find-by-members",
      memberIds
    );

    const groupData = response.data;

    // Map backend GroupResponse to frontend Group format (same as createGroupViaREST)
    const group: Group = {
      groupId: groupData.groupId,
      groupName: groupData.groupName,
      appointmentId: groupData.appointmentId,
      lastMessageContent: groupData.lastMessageContent || undefined,
      timeLastMessage: groupData.timeLastMessage || undefined,
      members: groupData.members || [],
      createdAt: groupData.createdAt || new Date().toISOString(),
      updatedAt: groupData.updatedAt || new Date().toISOString(),
    };

    return group;
  } catch (error: any) {
    // Handle 404 - Group not found (normal case)
    if (error.response?.status === 404) {
      return null;
    }

    return null;
  }
}

// ============ API Functions ============

/**
 * Get all groups for a user using REST API only (optimized for reliability)
 */
export async function getUserGroups(
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<Group[]> {
  // Use REST API directly for better reliability
  return await getUserGroupsViaREST(userId, page, size);
}

/**
 * Create a new group via WebSocket
 * ✅ FIX: Handle "Group already exists" error using new backend API
 */
export async function createGroupViaWebSocket(
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
    ...(appointmentId && { appointmentId }),
  };

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      webSocketChatService.removeMessageHandler(handler);
      reject(new Error("Timeout waiting for group creation"));
    }, 15000);

    const handler = (response: any) => {
      // ✅ CASE 1: Handle error response from backend
      if (response.action === "error") {
        const errorMessage = response.data || "";

        // Check if error is "Group already exists"
        if (errorMessage.includes("Group with these members already exists")) {
          clearTimeout(timeoutId);
          webSocketChatService.removeMessageHandler(handler);

          // ✅ SỬ DỤNG API MỚI - Nhanh và chính xác
          const memberIds = members.map((m) => m.userId);
          findGroupByMembersViaAPI(memberIds)
            .then((existingGroup) => {
              if (existingGroup) {
                resolve(existingGroup);
              } else {
                reject(
                  new Error(
                    "Group exists but could not be found. Please try again."
                  )
                );
              }
            })
            .catch((error) => {
              reject(
                new Error("Failed to load existing group: " + error.message)
              );
            });
        } else {
          // Other errors - reject normally
          clearTimeout(timeoutId);
          webSocketChatService.removeMessageHandler(handler);
          reject(new Error(errorMessage));
        }
      }
      // ✅ CASE 2: Handle group_created response (new group or existing from updated backend)
      else if (response.action === "group_created") {
        clearTimeout(timeoutId);
        webSocketChatService.removeMessageHandler(handler);

        if (response.status === "error") {
          reject(new Error(response.data));
        } else {
          resolve(response.data);
        }
      }
    };

    // Add handler and send create_group message
    webSocketChatService.addMessageHandler(handler);
    webSocketChatService.createGroup(createData);
  });
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
    ...(appointmentId && { appointmentId }),
  };

  try {
    const response = await chatApi.post<Group>(
      "/api/communication/groups",
      createData
    );

    const result = response.data;

    // Map backend GroupResponse to frontend Group format
    if (result && result.groupId) {
      const mappedGroup: Group = {
        groupId: result.groupId,
        groupName: result.groupName,
        appointmentId: result.appointmentId,
        lastMessageContent: result.lastMessageContent || undefined,
        timeLastMessage: result.timeLastMessage || undefined,
        members: result.members || [],
        createdAt: result.createdAt || new Date().toISOString(),
        updatedAt: result.updatedAt || new Date().toISOString(),
      };

      return mappedGroup;
    } else {
      throw new Error("Invalid response format from backend");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to create group: ${message}`);
  }
}

/**
 * Create a new group - MOBILE-COMPATIBLE: WebSocket only (no REST fallback)
 * Ensures FE Web behaves exactly like Mobile app
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

  // ✅ FORCE WebSocket ONLY - giống Mobile (no REST fallback)
  if (!webSocketChatService.isReady()) {
    await waitForWebSocketReady(10000); // Wait up to 10s
  }

  return await createGroupViaWebSocket(members, appointmentId, groupName);
}

/**
 * Send a message to a group
 */
export async function sendMessage(
  groupId: string,
  senderId: string,
  content: string,
  messageType: "TEXT" | "IMAGE" | "FILE" = "TEXT"
): Promise<Message> {
  await ensureConnection();

  const messageData: SendMessageData = {
    groupId,
    senderId,
    content,
    messageType,
  };

  const responsePromise = waitForResponse<Message>("message_received");
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

  const responsePromise = waitForResponse<Message[]>("messages");
  webSocketChatService.getMessages({ groupId, page, size });

  return responsePromise;
}

/**
 * Join a group
 */
export async function joinGroup(groupId: string): Promise<string> {
  await ensureConnection();

  const responsePromise = waitForResponse<string>("join_group");
  webSocketChatService.joinGroup(groupId);

  return responsePromise;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string): Promise<string> {
  await ensureConnection();

  const responsePromise = waitForResponse<string>("leave_group");
  webSocketChatService.leaveGroup(groupId);

  return responsePromise;
}

/**
 * Get WebSocket connection status
 */
export function getConnectionStatus():
  | "connecting"
  | "connected"
  | "disconnected"
  | "error" {
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
  messageType: "TEXT" | "IMAGE" | "FILE" = "TEXT",
  tempMessageId?: string
): Promise<Message> {
  console.log("[sendMessageViaREST] Sending message:", {
    groupId,
    senderId,
    content: content.substring(0, 30),
    tempMessageId,
  });

  try {
    const response = await chatApi.post<Message>(
      "/api/communication/messages",
      {
        groupId,
        senderId,
        content,
        messageType,
        tempMessageId,
      }
    );

    console.log(
      "[sendMessageViaREST] Success:",
      response.data.messageId,
      "tempId:",
      response.data.tempMessageId
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("[sendMessageViaREST] Failed:", message);
    throw new Error(`Failed to send message: ${message}`);
  }
}

/**
 * Get group messages via REST API (no WebSocket dependency)
 */
export async function getGroupMessagesViaREST(
  groupId: string,
  page: number = 0,
  size: number = 20
): Promise<Message[]> {
  try {
    const response = await chatApi.get<Message[]>(
      `/api/communication/groups/${groupId}/messages`,
      {
        params: { page, size },
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    // Handle 404 for empty groups gracefully
    if (error.response?.status === 404) {
      return [];
    }
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to get messages: ${message}`);
  }
}

/**
 * Get user groups via REST API (no WebSocket dependency)
 */
export async function getUserGroupsViaREST(
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<Group[]> {
  try {
    const response = await chatApi.get<Group[]>(
      `/api/communication/users/${userId}/groups`,
      {
        params: { page, size },
      }
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`Failed to get user groups: ${message}`);
  }
}

// Legacy compatibility exports
export { getUserGroups as getConversationsByUserId };
export { getGroupMessages as getMessagesByConversationId };
export { createGroup as createConversation };
export { sendMessage as sendChatMessage };

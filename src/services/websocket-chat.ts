/**
 * WebSocket Chat Service for Healthcare+ Application
 * Handles real-time communication with backend WebSocket server
 */

export interface ChatMember {
  userId: string;
  fullName: string;
  avatarUrl: string;
}

export interface WebSocketMessage {
  action: string;
  data: any;
}

export interface WebSocketResponse {
  action: string;
  status: string;
  data: any;
}

export interface CreateGroupData {
  groupName: string;
  appointmentId?: string;
  members: ChatMember[];
}

export interface SendMessageData {
  groupId: string;
  senderId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
}

export interface GetMessagesData {
  groupId: string;
  page?: number;
  size?: number;
}

export interface GetGroupsData {
  userId: string;
  page?: number;
  size?: number;
}

export type WebSocketMessageHandler = (response: WebSocketResponse) => void;

class WebSocketChatService {
  private ws: WebSocket | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Set<WebSocketMessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isConnecting = false;
  private connectionState: 'disconnected' | 'connecting' | 'handshaking' | 'ready' = 'disconnected';
  private connectionStabilizationDelay = 300;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionLock = false;
  private connectionPromise: Promise<void> | null = null;

  private readonly wsUrl: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:8085';
    this.wsUrl = `${baseUrl}/ws/communication`;
  }

  /**
   * Connect to WebSocket server with improved connection management
   */
  connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.ws?.readyState === WebSocket.OPEN && this.connectionState === 'ready') {
      return Promise.resolve();
    }

    if (this.connectionLock) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!this.connectionLock) {
            clearInterval(checkInterval);
            this.connect().then(resolve).catch(reject);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Connection lock timeout'));
        }, 5000);
      });
    }

    if (this.ws && (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED)) {
      this.ws = null;
      this.connectionState = 'disconnected';
    }

    this.connectionLock = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.connectionState = 'connecting';

        this.ws = new WebSocket(this.wsUrl);
        this.setupEventHandlers(resolve, reject);
      } catch (error) {
        this.resetConnectionState();
        reject(error);
      }
    });

    this.connectionPromise.finally(() => {
      this.connectionPromise = null;
      this.connectionLock = false;
    });

    return this.connectionPromise;
  }

  /**
   * Reset connection state
   */
  private resetConnectionState(): void {
    this.isConnecting = false;
    this.connectionState = 'disconnected';
    this.connectionLock = false;
    this.connectionPromise = null;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopPingPong();

    this.reconnectAttempts = this.maxReconnectAttempts;

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Normal closure');
      }
      this.ws = null;
    }

    this.messageQueue = [];
    this.resetConnectionState();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Check if WebSocket is ready for normal operations (after handshake)
   */
  isReady(): boolean {
    return this.isConnected() && this.connectionState === 'ready';
  }

  /**
   * Add message handler
   */
  addMessageHandler(handler: WebSocketMessageHandler): void {
    this.messageHandlers.add(handler);
  }

  /**
   * Remove message handler
   */
  removeMessageHandler(handler: WebSocketMessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Send message to WebSocket server
   */
  private sendMessage(action: string, data: any): void {
    const message: WebSocketMessage = { action, data };

    if (this.isReady()) {
      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        this.messageQueue.push(message);

        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.resetConnectionState();
          this.attemptReconnect();
        }
      }
    } else {
      this.messageQueue.push(message);

      if (this.connectionState === 'disconnected' && !this.connectionLock && !this.connectionPromise) {
        this.connect().catch(() => {
          // Silent error handling
        });
      }
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.connectionState = 'handshaking';

      setTimeout(() => {
        if (this.connectionState === 'handshaking') {
          this.startPingPong();
        }
        resolve();
      }, this.connectionStabilizationDelay);
    };

    this.ws.onmessage = (event) => {
      try {
        const response: WebSocketResponse = JSON.parse(event.data);
        this.handleIncomingMessage(response);
      } catch (error) {
        // Silent error handling
      }
    };

    this.ws.onclose = (event) => {
      this.stopPingPong();
      this.resetConnectionState();

      const shouldReconnect = event.code !== 1000 && event.code !== 1001 &&
                              this.reconnectAttempts < this.maxReconnectAttempts;

      if (shouldReconnect) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = () => {
      this.stopPingPong();
      this.resetConnectionState();

      if (this.reconnectAttempts === 0) {
        reject(new Error('Initial WebSocket connection failed'));
      }
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleIncomingMessage(response: WebSocketResponse): void {
    if ((response.action === 'welcome' || response.action === 'hello') && this.connectionState === 'handshaking') {
      this.connectionState = 'ready';

      setTimeout(() => {
        this.flushMessageQueue();
      }, 50);
    }

    if (response.action === 'pong') {
      return;
    }

    this.messageHandlers.forEach(handler => {
      try {
        handler(response);
      } catch (error) {
        // Silent error handling
      }
    });
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isReady()) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws!.send(JSON.stringify(message));
        } catch (error) {
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  /**
   * Start ping/pong mechanism for connection health check
   */
  private startPingPong(): void {
    this.stopPingPong();

    this.pingInterval = setInterval(() => {
      if (this.isReady()) {
        try {
          // Application-level health check
        } catch (error) {
          if (this.connectionState === 'ready') {
            this.connectionState = 'disconnected';
            this.attemptReconnect();
          }
        }
      }
    }, 60000);
  }

  /**
   * Stop ping/pong mechanism
   */
  private stopPingPong(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect with improved exponential backoff
   */
  private attemptReconnect(): void {
    if (this.connectionLock || this.connectionPromise) {
      return;
    }

    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      return;
    }

    const baseDelay = this.reconnectDelay;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(1.5, this.reconnectAttempts - 1), maxDelay);

    setTimeout(() => {
      if (this.connectionState === 'disconnected' && this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch(() => {
          // Silent error handling
        });
      }
    }, delay);
  }

  // =============== Chat API Methods ===============

  /**
   * Create a new group chat
   */
  createGroup(data: CreateGroupData): void {
    this.sendMessage('create_group', data);
  }

  /**
   * Send a chat message
   */
  sendChatMessage(data: SendMessageData): void {
    const messageData = {
      ...data,
      messageType: data.messageType || 'TEXT'
    };
    this.sendMessage('send_message', messageData);
  }

  /**
   * Get messages for a group
   */
  getMessages(data: GetMessagesData): void {
    const messageData = {
      groupId: data.groupId,
      page: data.page || 0,
      size: data.size || 20
    };
    this.sendMessage('get_messages', messageData);
  }

  /**
   * Get groups for a user
   */
  getUserGroups(data: GetGroupsData): void {
    const messageData = {
      userId: data.userId,
      page: data.page || 0,
      size: data.size || 20
    };
    this.sendMessage('get_groups', messageData);
  }

  /**
   * Join a group
   */
  joinGroup(groupId: string): void {
    this.sendMessage('join_group', { groupId });
  }

  /**
   * Leave a group
   */
  leaveGroup(groupId: string): void {
    this.sendMessage('leave_group', { groupId });
  }

  /**
   * Get connection status
   */
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.connectionState === 'connecting' || this.isConnecting) return 'connecting';
    if (this.connectionState === 'handshaking') return 'connecting';
    if (this.connectionState === 'ready') return 'connected';
    if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts) return 'connecting';
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return 'error';
    return 'disconnected';
  }
}

// Export singleton instance
export const webSocketChatService = new WebSocketChatService();
export default webSocketChatService;
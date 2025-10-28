/**
 * WebSocket Appointment Service
 * Handles real-time appointment events from backend
 * Reuses the same WebSocket connection from webSocketChatService
 */

import webSocketChatService, { WebSocketResponse } from './websocket-chat';

export type AppointmentSocketEvent =
  // Success events
  | 'BOOKING_APPOINTMENT'
  | 'UPDATE_APPOINTMENT_STATUS'
  | 'RESCHEDULE_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  // Failed events (from backend error handling)
  | 'BOOKING_APPOINTMENT_FAILED'
  | 'UPDATE_APPOINTMENT_STATUS_FAILED'
  | 'RESCHEDULE_APPOINTMENT_FAILED'
  | 'CANCEL_APPOINTMENT_FAILED';

export interface AppointmentSocketData {
  eventType: AppointmentSocketEvent;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  status?: string;
  success: boolean;
  message?: string;
  rejectReason?: string;
  skipRefetchForUserId?: string; // User ID that should skip refetch (because they already have updated data)
}

export interface AppointmentSocketResponse extends WebSocketResponse {
  action: 'schedule_appointment_response';
  type: 'broadcast' | 'error';
  data: AppointmentSocketData;
}

export type AppointmentEventHandler = (data: AppointmentSocketData) => void;

class WebSocketAppointmentService {
  private eventHandlers: Map<AppointmentSocketEvent, Set<AppointmentEventHandler>> = new Map();

  constructor() {
    // Initialize handler sets for each event type (both success and failed)
    const eventTypes: AppointmentSocketEvent[] = [
      // Success events
      'BOOKING_APPOINTMENT',
      'UPDATE_APPOINTMENT_STATUS',
      'RESCHEDULE_APPOINTMENT',
      'CANCEL_APPOINTMENT',
      // Failed events
      'BOOKING_APPOINTMENT_FAILED',
      'UPDATE_APPOINTMENT_STATUS_FAILED',
      'RESCHEDULE_APPOINTMENT_FAILED',
      'CANCEL_APPOINTMENT_FAILED'
    ];

    eventTypes.forEach(type => {
      this.eventHandlers.set(type, new Set());
    });

    // Subscribe to WebSocket messages for appointment events
    this.setupMessageHandler();
  }

  /**
   * Setup message handler to process appointment events
   */
  private setupMessageHandler(): void {
    webSocketChatService.addMessageHandler((response: WebSocketResponse) => {
      // Primary path: expected action name from backend contract
      if (response.action === 'schedule_appointment_response') {
        const appointmentResponse = response as AppointmentSocketResponse;
        this.handleAppointmentEvent(appointmentResponse.data);
        return;
      }

      // Fallbacks: some environments may send different action/type labels
      // 1) Same payload but with action 'schedule_appointment'
      if (response.action === 'schedule_appointment' && (response as any)?.data?.eventType) {
        this.handleAppointmentEvent((response as any).data);
        return;
      }

      // 2) Wrapped with a type field
      if ((response as any)?.type === 'APPOINTMENT_SOCKET_LIST' && (response as any)?.data?.eventType) {
        this.handleAppointmentEvent((response as any).data);
        return;
      }
    });
  }

  /**
   * Handle incoming appointment event and notify subscribers
   */
  private handleAppointmentEvent(data: AppointmentSocketData): void {
    const { eventType } = data;

    if (!eventType) {
      return;
    }

    // Get all handlers for this event type
    const handlers = this.eventHandlers.get(eventType);

    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to specific appointment event
   */
  subscribe(eventType: AppointmentSocketEvent, handler: AppointmentEventHandler): () => void {
    const handlers = this.eventHandlers.get(eventType);

    if (!handlers) {
      console.error(`[AppointmentSocket] Invalid event type: ${eventType}`);
      return () => {};
    }

    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
    };
  }

  /**
   * Subscribe to all appointment events
   */
  subscribeAll(handler: AppointmentEventHandler): () => void {
    const unsubscribeFns: (() => void)[] = [];

    this.eventHandlers.forEach((_, eventType) => {
      const unsubscribe = this.subscribe(eventType, handler);
      unsubscribeFns.push(unsubscribe);
    });

    // Return unsubscribe function that removes all subscriptions
    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }

  /**
   * Check if WebSocket connection is ready
   */
  isConnected(): boolean {
    return webSocketChatService.isReady();
  }

  /**
   * Get connection status
   */
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return webSocketChatService.getStatus();
  }

  /**
   * Send schedule appointment event via WebSocket
   * This manually triggers the event that backend expects
   */
  sendScheduleEvent(eventData: {
    appointmentId?: string | null;
    patientId: string;
    doctorId: string;
    event: AppointmentSocketEvent;
    createAppointmentRequest?: any;
    skipRefetchForUserId?: string; // Optional: User ID that should skip refetch
  }): void {
    if (!webSocketChatService.isReady()) {
      return;
    }

    try {
      // Format according to backend expectation
      const message = {
        action: 'schedule_appointment',
        data: {
          appointmentId: eventData.appointmentId || null,
          patientId: eventData.patientId,
          doctorId: eventData.doctorId,
          event: eventData.event,
          createAppointmentRequest: eventData.createAppointmentRequest || null,
          skipRefetchForUserId: eventData.skipRefetchForUserId || undefined
        }
      };

      // Send via underlying WebSocket service
      (webSocketChatService as any).sendMessage('schedule_appointment', message.data);
    } catch (error) {
      console.error('Failed to send schedule event:', error);
    }
  }
}

// Export singleton instance
export const webSocketAppointmentService = new WebSocketAppointmentService();
export default webSocketAppointmentService;

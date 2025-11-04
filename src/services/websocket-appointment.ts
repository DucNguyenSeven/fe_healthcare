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
  | 'REJECT_APPOINTMENT'
  // Failed events (from backend error handling)
  | 'BOOKING_APPOINTMENT_FAILED'
  | 'UPDATE_APPOINTMENT_STATUS_FAILED'
  | 'RESCHEDULE_APPOINTMENT_FAILED'
  | 'CANCEL_APPOINTMENT_FAILED'
  | 'REJECT_APPOINTMENT_FAILED';

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
      'REJECT_APPOINTMENT',
      // Failed events
      'BOOKING_APPOINTMENT_FAILED',
      'UPDATE_APPOINTMENT_STATUS_FAILED',
      'RESCHEDULE_APPOINTMENT_FAILED',
      'CANCEL_APPOINTMENT_FAILED',
      'REJECT_APPOINTMENT_FAILED'
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
      // Debug: Log all incoming messages to understand structure
      console.log('🔍 [WebSocketAppointment] Received message:', {
        action: response.action,
        type: (response as any)?.type,
        status: response.status,
        dataStructure: response.data ? {
          hasEventType: !!(response.data as any)?.eventType,
          eventType: (response.data as any)?.eventType,
          keys: Object.keys(response.data || {})
        } : 'no data',
        fullResponse: response
      });

      // Primary path: expected action name from backend contract
      if (response.action === 'schedule_appointment_response') {
        const appointmentResponse = response as AppointmentSocketResponse;
        console.log('✅ [WebSocketAppointment] Using primary path (schedule_appointment_response)', {
          data: appointmentResponse.data,
          eventType: appointmentResponse.data?.eventType
        });
        this.handleAppointmentEvent(appointmentResponse.data);
        return;
      }

      // Fallbacks: some environments may send different action/type labels
      // 1) Same payload but with action 'schedule_appointment'
      if (response.action === 'schedule_appointment' && (response as any)?.data?.eventType) {
        console.log('✅ [WebSocketAppointment] Using fallback path 1 (schedule_appointment)', {
          data: (response as any).data,
          eventType: (response as any).data?.eventType
        });
        this.handleAppointmentEvent((response as any).data);
        return;
      }

      // 2) Wrapped with a type field
      if ((response as any)?.type === 'APPOINTMENT_SOCKET_LIST' && (response as any)?.data?.eventType) {
        console.log('✅ [WebSocketAppointment] Using fallback path 2 (APPOINTMENT_SOCKET_LIST)', {
          data: (response as any).data,
          eventType: (response as any).data?.eventType
        });
        this.handleAppointmentEvent((response as any).data);
        return;
      }

      // Debug: Log if message was not handled
      if (response.action?.includes('appointment') || response.action?.includes('schedule')) {
        console.warn('⚠️ [WebSocketAppointment] Message not handled:', {
          action: response.action,
          type: (response as any)?.type,
          data: response.data
        });
      }
    });
  }

  /**
   * Handle incoming appointment event and notify subscribers
   */
  private handleAppointmentEvent(data: AppointmentSocketData): void {
    const { eventType } = data;

    console.log('🔍 [WebSocketAppointment] handleAppointmentEvent called:', {
      eventType,
      hasEventType: !!eventType,
      dataKeys: Object.keys(data),
      fullData: data
    });

    if (!eventType) {
      console.warn('⚠️ [WebSocketAppointment] No eventType found in data:', data);
      return;
    }

    // Get all handlers for this event type
    const handlers = this.eventHandlers.get(eventType);

    console.log(`📋 [WebSocketAppointment] Event type: ${eventType}, Handlers found: ${handlers?.size || 0}`);

    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => {
        try {
          console.log(`✅ [WebSocketAppointment] Calling handler for ${eventType}`);
          handler(data);
        } catch (error) {
          console.error(`❌ [WebSocketAppointment] Error in handler for ${eventType}:`, error);
        }
      });
    } else {
      console.warn(`⚠️ [WebSocketAppointment] No handlers registered for eventType: ${eventType}`);
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
    status?: string; // Optional: Status for UPDATE_APPOINTMENT_STATUS event
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
          skipRefetchForUserId: eventData.skipRefetchForUserId || undefined,
          status: eventData.status || undefined // Include status if provided
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

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
      // 🔍 ENHANCED DEBUG: Log every incoming WS message with full details
      console.log('🔍 [AppointmentSocket] Received WebSocket message:', {
        action: (response as any)?.action,
        status: (response as any)?.status,
        type: (response as any)?.type,
        dataType: typeof response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
        hasEventType: !!(response as any)?.data?.eventType,
        fullData: response?.data
      });

      // Primary path: expected action name from backend contract
      if (response.action === 'schedule_appointment_response') {
        console.log('✅ [AppointmentSocket] MATCHED schedule_appointment_response!', response.data);
        const appointmentResponse = response as AppointmentSocketResponse;
        this.handleAppointmentEvent(appointmentResponse.data);
        return;
      }

      // Fallbacks: some environments may send different action/type labels
      // 1) Same payload but with action 'schedule_appointment'
      if (response.action === 'schedule_appointment' && (response as any)?.data?.eventType) {
        console.log('✅ [AppointmentSocket] FALLBACK 1: Matched schedule_appointment with eventType');
        this.handleAppointmentEvent((response as any).data);
        return;
      }

      // 2) Wrapped with a type field
      if ((response as any)?.type === 'APPOINTMENT_SOCKET_LIST' && (response as any)?.data?.eventType) {
        console.log('✅ [AppointmentSocket] FALLBACK 2: Matched APPOINTMENT_SOCKET_LIST');
        this.handleAppointmentEvent((response as any).data);
        return;
      }

      // 🔍 DEBUG: Log when message doesn't match any pattern
      if (response.action && response.action.includes('appointment') || response.action === 'schedule_appointment') {
        console.warn('⚠️ [AppointmentSocket] Message contains "appointment" but did not match any handler:', {
          action: response.action,
          data: response.data
        });
      }
    });
  }

  /**
   * Handle incoming appointment event and notify subscribers
   */
  private handleAppointmentEvent(data: AppointmentSocketData): void {
    console.log('🔍 [AppointmentSocket] handleAppointmentEvent called with:', data);

    const { eventType } = data;

    if (!eventType) {
      console.error('❌ [AppointmentSocket] Missing eventType in appointment data:', data);
      return;
    }

    // Get all handlers for this event type
    const handlers = this.eventHandlers.get(eventType);

    console.log(`🔍 [AppointmentSocket] Found ${handlers?.size || 0} handler(s) for eventType: ${eventType}`);

    if (handlers && handlers.size > 0) {
      console.log(`✅ [AppointmentSocket] Notifying ${handlers.size} handler(s) for ${eventType}`);
      handlers.forEach(handler => {
        try {
          handler(data);
          console.log(`✅ [AppointmentSocket] Handler executed successfully for ${eventType}`);
        } catch (error) {
          console.error(`❌ [AppointmentSocket] Error in handler for ${eventType}:`, error);
        }
      });
    } else {
      console.warn(`⚠️ [AppointmentSocket] No handlers registered for event: ${eventType}`);
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
  }): void {
    // 🔍 DEBUG: Check WebSocket status before sending
    console.log('🔍 [AppointmentSocket] Checking WebSocket status:', {
      isReady: webSocketChatService.isReady(),
      isConnected: webSocketChatService.isConnected(),
      isAuthenticated: webSocketChatService.isUserAuthenticated(),
      status: webSocketChatService.getStatus()
    });

    if (!webSocketChatService.isReady()) {
      console.warn('⚠️ [AppointmentSocket] WebSocket not ready, cannot send event');
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
          createAppointmentRequest: eventData.createAppointmentRequest || null
        }
      };

      // 🔍 DEBUG: Log message before sending
      console.log('📤 [AppointmentSocket] Sending message to backend:', JSON.stringify(message, null, 2));

      // Send via underlying WebSocket service
      (webSocketChatService as any).sendMessage('schedule_appointment', message.data);

      console.log('✅ [AppointmentSocket] Successfully sent schedule event:', eventData.event);
    } catch (error) {
      console.error('❌ [AppointmentSocket] Failed to send schedule event:', error);
    }
  }
}

// Export singleton instance
export const webSocketAppointmentService = new WebSocketAppointmentService();
export default webSocketAppointmentService;

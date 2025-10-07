'use client'

import React, { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { toast } from 'sonner';
import webSocketAppointmentService, {
  AppointmentSocketData,
  AppointmentSocketEvent
} from '@/services/websocket-appointment';

// ============ Context Types ============

interface WebSocketAppointmentContextType {
  // Connection status
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';

  // Appointment event callbacks
  onAppointmentUpdate: (callback: () => void) => () => void;
}

const WebSocketAppointmentContext = createContext<WebSocketAppointmentContextType | null>(null);

// ============ Provider ============

interface WebSocketAppointmentProviderProps {
  children: ReactNode;
}

export function WebSocketAppointmentProvider({ children }: WebSocketAppointmentProviderProps) {
  const { user, isAuthenticated } = useAuthContext();

  // Refs để track callbacks
  const updateCallbacksRef = useRef<Set<() => void>>(new Set());

  // Ref để track các message đã show toast (tránh duplicate)
  const shownToastAppointmentsRef = useRef<Set<string>>(new Set());

  // ============ Event Handlers ============

  /**
   * Handle BOOKING_APPOINTMENT event
   */
  const handleBookingAppointment = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, success } = data;

    if (!success || !user) return;

    // Prevent duplicate toasts
    const toastKey = `booking-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    // Auto cleanup after 1 minute
    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Trigger callbacks to refetch appointments
    updateCallbacksRef.current.forEach(callback => callback());

    // Show notification based on user role
    if (user.role === 'DOCTOR' && doctorId === user.userId) {
      // Doctor receives notification about new booking
      toast.info('Lịch hẹn mới', {
        description: 'Bệnh nhân vừa đặt lịch khám. Vui lòng xác nhận.',
        duration: 8000,
        action: {
          label: 'Xem',
          onClick: () => {
            // Navigate to appointments tab
            window.location.href = '/doctor/dashboard?tab=appointments';
          }
        }
      });
    } else if (user.role === 'PATIENT' && patientId === user.userId) {
      // Patient receives confirmation after booking
      toast.success('Đặt lịch thành công!', {
        description: 'Chờ bác sĩ xác nhận. Bạn sẽ nhận thông báo khi được chấp nhận.',
        duration: 6000
      });
    }
  }, [user]);

  /**
   * Handle UPDATE_APPOINTMENT_STATUS event
   */
  const handleUpdateStatus = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, status, success, rejectReason } = data;

    if (!success || !user || !status) return;

    // Prevent duplicate toasts
    const toastKey = `status-${appointmentId}-${status}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    // Auto cleanup
    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Trigger callbacks to refetch appointments
    updateCallbacksRef.current.forEach(callback => callback());

    // Notifications based on status and role
    if (user.role === 'PATIENT' && patientId === user.userId) {
      // Patient receives status update
      if (status === 'CONFIRMED') {
        toast.success('Lịch hẹn được chấp nhận', {
          description: 'Bác sĩ đã xác nhận lịch khám của bạn',
          duration: 6000,
          action: {
            label: 'Xem',
            onClick: () => {
              window.location.href = '/appointments';
            }
          }
        });
      } else if (status === 'REJECTED') {
        toast.error('Lịch hẹn bị từ chối', {
          description: rejectReason || 'Bác sĩ không thể nhận lịch này. Vui lòng đặt lại.',
          duration: 8000,
          action: {
            label: 'Đặt lại',
            onClick: () => {
              window.location.href = '/appointments';
            }
          }
        });
      } else if (status === 'COMPLETED') {
        toast.success('Khám bệnh hoàn tất', {
          description: 'Bạn có thể xem kết quả khám bệnh',
          duration: 6000,
          action: {
            label: 'Xem kết quả',
            onClick: () => {
              window.location.href = '/appointments';
            }
          }
        });
      }
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      // Doctor receives notification (for completed status from system)
      if (status === 'CANCELED') {
        toast.warning('Lịch hẹn bị hủy', {
          description: 'Bệnh nhân đã hủy lịch khám',
          duration: 5000
        });
      }
    }
  }, [user]);

  /**
   * Handle RESCHEDULE_APPOINTMENT event
   */
  const handleReschedule = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, success } = data;

    if (!success || !user) return;

    const toastKey = `reschedule-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Trigger callbacks
    updateCallbacksRef.current.forEach(callback => callback());

    if (user.role === 'PATIENT' && patientId === user.userId) {
      toast.success('Đổi lịch thành công', {
        description: 'Lịch hẹn đã được cập nhật. Chờ bác sĩ xác nhận.',
        duration: 6000
      });
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      toast.info('Lịch hẹn được đổi', {
        description: 'Bệnh nhân đã đổi lịch khám. Vui lòng xác nhận lại.',
        duration: 6000
      });
    }
  }, [user]);

  /**
   * Handle CANCEL_APPOINTMENT event
   */
  const handleCancel = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, success } = data;

    if (!success || !user) return;

    const toastKey = `cancel-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Trigger callbacks
    updateCallbacksRef.current.forEach(callback => callback());

    if (user.role === 'PATIENT' && patientId === user.userId) {
      toast.success('Hủy lịch thành công', {
        description: 'Lịch hẹn đã được hủy',
        duration: 5000
      });
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      toast.warning('Lịch hẹn bị hủy', {
        description: 'Bệnh nhân đã hủy lịch khám',
        duration: 5000
      });
    }
  }, [user]);

  // ============ Effects ============

  /**
   * Subscribe to appointment events when authenticated
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Subscribe to all appointment events
    const unsubscribeBooking = webSocketAppointmentService.subscribe(
      'BOOKING_APPOINTMENT',
      handleBookingAppointment
    );

    const unsubscribeStatus = webSocketAppointmentService.subscribe(
      'UPDATE_APPOINTMENT_STATUS',
      handleUpdateStatus
    );

    const unsubscribeReschedule = webSocketAppointmentService.subscribe(
      'RESCHEDULE_APPOINTMENT',
      handleReschedule
    );

    const unsubscribeCancel = webSocketAppointmentService.subscribe(
      'CANCEL_APPOINTMENT',
      handleCancel
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeBooking();
      unsubscribeStatus();
      unsubscribeReschedule();
      unsubscribeCancel();
    };
  }, [isAuthenticated, user, handleBookingAppointment, handleUpdateStatus, handleReschedule, handleCancel]);

  // ============ Public Methods ============

  /**
   * Register callback to be called when appointments should be refetched
   */
  const onAppointmentUpdate = useCallback((callback: () => void): (() => void) => {
    updateCallbacksRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      updateCallbacksRef.current.delete(callback);
    };
  }, []);

  // ============ Context Value ============

  const contextValue: WebSocketAppointmentContextType = {
    connectionStatus: webSocketAppointmentService.getStatus(),
    onAppointmentUpdate
  };

  return (
    <WebSocketAppointmentContext.Provider value={contextValue}>
      {children}
    </WebSocketAppointmentContext.Provider>
  );
}

// ============ Hook ============

export function useWebSocketAppointment() {
  const context = useContext(WebSocketAppointmentContext);
  if (!context) {
    throw new Error('useWebSocketAppointment must be used within a WebSocketAppointmentProvider');
  }
  return context;
}

export default WebSocketAppointmentContext;

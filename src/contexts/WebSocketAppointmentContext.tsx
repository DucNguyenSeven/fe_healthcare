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
    console.log('🔍 [AppointmentContext] handleBookingAppointment called:', {
      data,
      user: user ? { userId: user.userId, role: user.role } : null
    });

    const { appointmentId, patientId, doctorId, success, skipRefetchForUserId } = data;

    if (!success) {
      console.warn('⚠️ [AppointmentContext] Appointment booking not successful, skipping');
      return;
    }

    if (!user) {
      console.warn('⚠️ [AppointmentContext] User not available, skipping');
      return;
    }

    // Prevent duplicate toasts
    const toastKey = `booking-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) {
      console.log('🔍 [AppointmentContext] Toast already shown for this appointment, skipping');
      return;
    }
    shownToastAppointmentsRef.current.add(toastKey);

    // Auto cleanup after 1 minute
    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show notification and refetch ONLY for relevant user
    if (user.role === 'DOCTOR' && doctorId === user.userId) {
      console.log('✅ [AppointmentContext] Showing notification for DOCTOR');

      // Only trigger refetch if this user is not the one who initiated the action
      const shouldSkipRefetch = skipRefetchForUserId === user.userId;

      if (!shouldSkipRefetch) {
        // Trigger refetch callbacks for doctor
        console.log(`🔍 [AppointmentContext] Triggering ${updateCallbacksRef.current.size} refetch callback(s) for DOCTOR`);
        updateCallbacksRef.current.forEach(callback => {
          try {
            callback();
            console.log('✅ [AppointmentContext] Refetch callback executed successfully');
          } catch (error) {
            console.error('❌ [AppointmentContext] Error in refetch callback:', error);
          }
        });
      } else {
        console.log('🔍 [AppointmentContext] Skipping refetch for doctor who initiated booking:', user.userId);
      }

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
      console.log('✅ [AppointmentContext] Showing notification for PATIENT');

      // Dismiss loading toast from AppointmentsPage before showing final success
      toast.dismiss('booking-confirmation');

      // Only trigger refetch if this user is not the one who initiated the action
      const shouldSkipRefetch = skipRefetchForUserId === user.userId;

      if (!shouldSkipRefetch) {
        // Trigger refetch callbacks for patient
        console.log(`🔍 [AppointmentContext] Triggering ${updateCallbacksRef.current.size} refetch callback(s) for PATIENT`);
        updateCallbacksRef.current.forEach(callback => {
          try {
            callback();
            console.log('✅ [AppointmentContext] Refetch callback executed successfully');
          } catch (error) {
            console.error('❌ [AppointmentContext] Error in refetch callback:', error);
          }
        });
      } else {
        console.log('🔍 [AppointmentContext] Skipping refetch for patient who initiated booking:', user.userId);
      }

      // Patient receives confirmation after booking
      toast.success('Đặt lịch thành công!', {
        description: 'Chờ bác sĩ xác nhận. Bạn sẽ nhận thông báo khi được chấp nhận.',
        duration: 6000
      });

      // 💾 Save prediction data if this booking came from CKD prediction
      // NOTE: This is moved here from AppointmentsPage because we need appointmentId from WebSocket response
      const pendingPrediction = localStorage.getItem('pending_ckd_prediction');
      if (pendingPrediction && appointmentId) {
        console.log('💾 [AppointmentContext] Found pending prediction, saving after successful booking...');

        // Import necessary functions (will be available from AppointmentsPage context)
        // For now, just clean up localStorage - actual save will be handled by AppointmentsPage
        try {
          console.log('🧹 [AppointmentContext] Cleaning up prediction from localStorage');
          // Don't remove here - let AppointmentsPage handle it when it refetches
          // localStorage.removeItem('pending_ckd_prediction');
        } catch (err) {
          console.error('❌ [AppointmentContext] Error handling prediction:', err);
        }
      }
    } else {
      console.log('⚠️ [AppointmentContext] User role/ID does not match, skipping refetch and notification:', {
        userRole: user.role,
        userId: user.userId,
        doctorId,
        patientId
      });
    }
  }, [user]);

  /**
   * Handle UPDATE_APPOINTMENT_STATUS event
   */
  const handleUpdateStatus = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, status, success, rejectReason, skipRefetchForUserId } = data;

    if (!success || !user || !status) return;

    // Prevent duplicate toasts
    const toastKey = `status-${appointmentId}-${status}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    // Auto cleanup
    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Notifications and refetch ONLY for relevant user
    if (user.role === 'PATIENT' && patientId === user.userId) {
      // Only trigger refetch if this user is not the one who initiated the action
      const shouldSkipRefetch = skipRefetchForUserId === user.userId;

      if (!shouldSkipRefetch) {
        // Trigger refetch callbacks for patient
        updateCallbacksRef.current.forEach(callback => callback());
      } else {
        console.log('🔍 [AppointmentContext] Skipping refetch for user who initiated action:', user.userId);
      }

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
      // Only trigger refetch if this user is not the one who initiated the action
      const shouldSkipRefetch = skipRefetchForUserId === user.userId;

      if (!shouldSkipRefetch) {
        // Trigger refetch callbacks for doctor
        updateCallbacksRef.current.forEach(callback => callback());
      } else {
        console.log('🔍 [AppointmentContext] Skipping refetch for doctor who initiated action:', user.userId);
      }

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

    // Trigger callbacks and show notification ONLY for relevant user
    if (user.role === 'PATIENT' && patientId === user.userId) {
      updateCallbacksRef.current.forEach(callback => callback());
      toast.success('Đổi lịch thành công', {
        description: 'Lịch hẹn đã được cập nhật. Chờ bác sĩ xác nhận.',
        duration: 6000
      });
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      updateCallbacksRef.current.forEach(callback => callback());
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

    // Trigger callbacks and show notification ONLY for relevant user
    if (user.role === 'PATIENT' && patientId === user.userId) {
      updateCallbacksRef.current.forEach(callback => callback());
      toast.success('Hủy lịch thành công', {
        description: 'Lịch hẹn đã được hủy',
        duration: 5000
      });
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      updateCallbacksRef.current.forEach(callback => callback());
      toast.warning('Lịch hẹn bị hủy', {
        description: 'Bệnh nhân đã hủy lịch khám',
        duration: 5000
      });
    }
  }, [user]);

  // ============ FAILED Event Handlers ============

  /**
   * Handle BOOKING_APPOINTMENT_FAILED event
   */
  const handleBookingAppointmentFailed = useCallback((data: AppointmentSocketData) => {
    console.log('🔍 [AppointmentContext] handleBookingAppointmentFailed called:', data);

    const { appointmentId, patientId, doctorId, message } = data;

    if (!user) {
      console.warn('⚠️ [AppointmentContext] User not available, skipping');
      return;
    }

    // Prevent duplicate toasts
    const toastKey = `booking-failed-${appointmentId || Date.now()}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) {
      console.log('🔍 [AppointmentContext] Toast already shown for this failed booking');
      return;
    }
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show error notification and refetch ONLY for relevant user
    if (user.role === 'PATIENT' && patientId === user.userId) {
      console.log('❌ [AppointmentContext] Showing error notification for PATIENT');

      // Dismiss loading toast from AppointmentsPage before showing error
      toast.dismiss('booking-confirmation');

      // Trigger refetch callbacks for patient (to show updated available slots)
      console.log(`🔍 [AppointmentContext] Triggering ${updateCallbacksRef.current.size} refetch callback(s) for PATIENT (failed booking)`);
      updateCallbacksRef.current.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('❌ [AppointmentContext] Error in refetch callback:', error);
        }
      });

      toast.error('Đặt lịch thất bại!', {
        description: message || 'Time slot đã hết, vui lòng chọn slot khác.',
        duration: 8000,
        action: {
          label: 'Chọn lại',
          onClick: () => {
            // User can re-select available slot
            window.location.reload();
          }
        }
      });
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      console.log('❌ [AppointmentContext] Showing error notification for DOCTOR');

      // Trigger refetch callbacks for doctor
      console.log(`🔍 [AppointmentContext] Triggering ${updateCallbacksRef.current.size} refetch callback(s) for DOCTOR (failed booking)`);
      updateCallbacksRef.current.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('❌ [AppointmentContext] Error in refetch callback:', error);
        }
      });

      toast.error('Lỗi đặt lịch', {
        description: message || 'Có lỗi xảy ra khi xử lý yêu cầu đặt lịch.',
        duration: 6000
      });
    } else {
      console.log('⚠️ [AppointmentContext] User role/ID does not match, skipping refetch and notification:', {
        userRole: user.role,
        userId: user.userId,
        doctorId,
        patientId
      });
    }
  }, [user]);

  /**
   * Handle UPDATE_APPOINTMENT_STATUS_FAILED event
   */
  const handleUpdateStatusFailed = useCallback((data: AppointmentSocketData) => {
    console.log('🔍 [AppointmentContext] handleUpdateStatusFailed called:', data);

    const { appointmentId, patientId, doctorId, message } = data;

    if (!user) return;

    const toastKey = `update-failed-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show error notification and refetch ONLY for relevant user
    if ((user.role === 'PATIENT' && patientId === user.userId) ||
        (user.role === 'DOCTOR' && doctorId === user.userId)) {
      // Trigger callbacks
      updateCallbacksRef.current.forEach(callback => callback());

      // Show error notification
      toast.error('Không thể cập nhật trạng thái', {
        description: message || 'Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn.',
        duration: 6000
      });
    }
  }, [user]);

  /**
   * Handle RESCHEDULE_APPOINTMENT_FAILED event
   */
  const handleRescheduleFailed = useCallback((data: AppointmentSocketData) => {
    console.log('🔍 [AppointmentContext] handleRescheduleFailed called:', data);

    const { appointmentId, patientId, doctorId, message } = data;

    if (!user) return;

    const toastKey = `reschedule-failed-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show error notification and refetch ONLY for relevant user
    if ((user.role === 'PATIENT' && patientId === user.userId) ||
        (user.role === 'DOCTOR' && doctorId === user.userId)) {
      // Trigger callbacks
      updateCallbacksRef.current.forEach(callback => callback());

      toast.error('Không thể đổi lịch', {
        description: message || 'Có lỗi xảy ra khi đổi lịch hẹn.',
        duration: 6000
      });
    }
  }, [user]);

  /**
   * Handle CANCEL_APPOINTMENT_FAILED event
   */
  const handleCancelFailed = useCallback((data: AppointmentSocketData) => {
    console.log('🔍 [AppointmentContext] handleCancelFailed called:', data);

    const { appointmentId, patientId, doctorId, message } = data;

    if (!user) return;

    const toastKey = `cancel-failed-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show error notification and refetch ONLY for relevant user
    if ((user.role === 'PATIENT' && patientId === user.userId) ||
        (user.role === 'DOCTOR' && doctorId === user.userId)) {
      // Trigger callbacks
      updateCallbacksRef.current.forEach(callback => callback());

      toast.error('Không thể hủy lịch', {
        description: message || 'Có lỗi xảy ra khi hủy lịch hẹn.',
        duration: 6000
      });
    }
  }, [user]);

  // ============ Effects ============

  /**
   * Subscribe to appointment events when authenticated
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('🔍 [AppointmentContext] Not subscribing - user not authenticated');
      return;
    }

    console.log('🔍 [AppointmentContext] Setting up appointment event subscriptions for user:', {
      userId: user.userId,
      role: user.role
    });

    // Subscribe to SUCCESS events
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

    // Subscribe to FAILED events
    const unsubscribeBookingFailed = webSocketAppointmentService.subscribe(
      'BOOKING_APPOINTMENT_FAILED',
      handleBookingAppointmentFailed
    );

    const unsubscribeStatusFailed = webSocketAppointmentService.subscribe(
      'UPDATE_APPOINTMENT_STATUS_FAILED',
      handleUpdateStatusFailed
    );

    const unsubscribeRescheduleFailed = webSocketAppointmentService.subscribe(
      'RESCHEDULE_APPOINTMENT_FAILED',
      handleRescheduleFailed
    );

    const unsubscribeCancelFailed = webSocketAppointmentService.subscribe(
      'CANCEL_APPOINTMENT_FAILED',
      handleCancelFailed
    );

    console.log('✅ [AppointmentContext] All appointment event handlers registered (success + failed)');

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔍 [AppointmentContext] Cleaning up appointment event subscriptions');
      // Unsubscribe success events
      unsubscribeBooking();
      unsubscribeStatus();
      unsubscribeReschedule();
      unsubscribeCancel();
      // Unsubscribe failed events
      unsubscribeBookingFailed();
      unsubscribeStatusFailed();
      unsubscribeRescheduleFailed();
      unsubscribeCancelFailed();
    };
  }, [
    isAuthenticated,
    user,
    handleBookingAppointment,
    handleUpdateStatus,
    handleReschedule,
    handleCancel,
    handleBookingAppointmentFailed,
    handleUpdateStatusFailed,
    handleRescheduleFailed,
    handleCancelFailed
  ]);

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

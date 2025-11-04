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
    const { appointmentId, patientId, doctorId, success, skipRefetchForUserId } = data;

    if (!success || !user) {
      return;
    }

    // Prevent duplicate toasts
    const toastKey = `booking-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) {
      return;
    }
    shownToastAppointmentsRef.current.add(toastKey);

    // Auto cleanup after 1 minute
    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show notification and refetch ONLY for relevant user
    if (user.role === 'DOCTOR' && doctorId === user.userId) {
      // Only trigger refetch if this user is not the one who initiated the action
      const shouldSkipRefetch = skipRefetchForUserId === user.userId;

      if (!shouldSkipRefetch) {
        // Trigger refetch callbacks for doctor
        updateCallbacksRef.current.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Error in refetch callback:', error);
          }
        });
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
      // Dismiss loading toast from AppointmentsPage before showing final success
      toast.dismiss('booking-confirmation');

      // Only trigger refetch if this user is not the one who initiated the action
      const shouldSkipRefetch = skipRefetchForUserId === user.userId;

      if (!shouldSkipRefetch) {
        // Trigger refetch callbacks for patient
        updateCallbacksRef.current.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Error in refetch callback:', error);
          }
        });
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
        // Import necessary functions (will be available from AppointmentsPage context)
        // For now, just clean up localStorage - actual save will be handled by AppointmentsPage
        try {
          // Don't remove here - let AppointmentsPage handle it when it refetches
          // localStorage.removeItem('pending_ckd_prediction');
        } catch (err) {
          console.error('Error handling prediction:', err);
        }
      }
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
      // Always trigger refetch for doctor to update UI
      // Even if they initiated the action, refetch to get updated status from backend
      updateCallbacksRef.current.forEach(callback => callback());

      // Doctor receives notification based on status
      if (status === 'CANCELED') {
        toast.warning('Lịch hẹn bị hủy', {
          description: 'Bệnh nhân đã hủy lịch khám',
          duration: 5000
        });
      } else if (status === 'REJECTED') {
        // Dismiss loading toast if exists
        toast.dismiss(`reject-${appointmentId}`);
        toast.success('Đã từ chối lịch hẹn', {
          description: 'Bệnh nhân sẽ nhận được thông báo',
          duration: 4000
        });
      } else if (status === 'CONFIRMED') {
        // Dismiss loading toast if exists
        toast.dismiss(`confirm-${appointmentId}`);
        toast.success('Đã xác nhận lịch hẹn', {
          description: 'Bệnh nhân sẽ nhận được thông báo',
          duration: 4000
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
      // Dismiss loading toast if exists
      toast.dismiss(`cancel-${appointmentId}`);
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

  /**
   * Handle REJECT_APPOINTMENT event
   */
  const handleReject = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, success } = data;

    if (!success || !user) return;

    const toastKey = `reject-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Trigger callbacks and show notification ONLY for relevant user
    if (user.role === 'PATIENT' && patientId === user.userId) {
      // Dismiss loading toast if exists
      toast.dismiss(`reject-${appointmentId}`);
      updateCallbacksRef.current.forEach(callback => callback());
      toast.error('Lịch hẹn bị từ chối', {
        description: 'Bác sĩ không thể nhận lịch này. Vui lòng đặt lại.',
        duration: 8000,
        action: {
          label: 'Đặt lại',
          onClick: () => {
            window.location.href = '/patient/appointments';
          }
        }
      });
    } else if (user.role === 'DOCTOR' && doctorId === user.userId) {
      // Dismiss loading toast if exists
      toast.dismiss(`reject-${appointmentId}`);
      updateCallbacksRef.current.forEach(callback => callback());
      toast.success('Đã từ chối lịch hẹn', {
        description: 'Bệnh nhân sẽ nhận được thông báo',
        duration: 4000
      });
    }
  }, [user]);

  // ============ FAILED Event Handlers ============

  /**
   * Handle BOOKING_APPOINTMENT_FAILED event
   */
  const handleBookingAppointmentFailed = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, message } = data;

    if (!user) {
      return;
    }

    // Prevent duplicate toasts
    const toastKey = `booking-failed-${appointmentId || Date.now()}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) {
      return;
    }
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show error notification and refetch ONLY for relevant user
    if (user.role === 'PATIENT' && patientId === user.userId) {
      // Dismiss loading toast from AppointmentsPage before showing error
      toast.dismiss('booking-confirmation');

      // Trigger refetch callbacks for patient (to show updated available slots)
      updateCallbacksRef.current.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in refetch callback:', error);
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
      // Trigger refetch callbacks for doctor
      updateCallbacksRef.current.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in refetch callback:', error);
        }
      });

      toast.error('Lỗi đặt lịch', {
        description: message || 'Có lỗi xảy ra khi xử lý yêu cầu đặt lịch.',
        duration: 6000
      });
    }
  }, [user]);

  /**
   * Handle UPDATE_APPOINTMENT_STATUS_FAILED event
   */
  const handleUpdateStatusFailed = useCallback((data: AppointmentSocketData) => {
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
      // Dismiss loading toasts
      if (appointmentId) {
        toast.dismiss(`reject-${appointmentId}`);
        toast.dismiss(`confirm-${appointmentId}`);
      }

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
      // Dismiss loading toasts
      if (appointmentId) {
        toast.dismiss(`cancel-${appointmentId}`);
      }

      // Trigger callbacks
      updateCallbacksRef.current.forEach(callback => callback());

      toast.error('Không thể hủy lịch', {
        description: message || 'Có lỗi xảy ra khi hủy lịch hẹn.',
        duration: 6000
      });
    }
  }, [user]);

  /**
   * Handle REJECT_APPOINTMENT_FAILED event
   */
  const handleRejectFailed = useCallback((data: AppointmentSocketData) => {
    const { appointmentId, patientId, doctorId, message } = data;

    if (!user) return;

    const toastKey = `reject-failed-${appointmentId}`;
    if (shownToastAppointmentsRef.current.has(toastKey)) return;
    shownToastAppointmentsRef.current.add(toastKey);

    setTimeout(() => {
      shownToastAppointmentsRef.current.delete(toastKey);
    }, 60000);

    // Show error notification and refetch ONLY for relevant user
    if ((user.role === 'PATIENT' && patientId === user.userId) ||
        (user.role === 'DOCTOR' && doctorId === user.userId)) {
      // Dismiss loading toasts
      if (appointmentId) {
        toast.dismiss(`reject-${appointmentId}`);
      }

      // Trigger callbacks
      updateCallbacksRef.current.forEach(callback => callback());

      toast.error('Không thể từ chối lịch hẹn', {
        description: message || 'Có lỗi xảy ra khi từ chối lịch hẹn.',
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
      return;
    }

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

    const unsubscribeReject = webSocketAppointmentService.subscribe(
      'REJECT_APPOINTMENT',
      handleReject
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

    const unsubscribeRejectFailed = webSocketAppointmentService.subscribe(
      'REJECT_APPOINTMENT_FAILED',
      handleRejectFailed
    );

    // Cleanup subscriptions on unmount
    return () => {
      // Unsubscribe success events
      unsubscribeBooking();
      unsubscribeStatus();
      unsubscribeReschedule();
      unsubscribeCancel();
      unsubscribeReject();
      // Unsubscribe failed events
      unsubscribeBookingFailed();
      unsubscribeStatusFailed();
      unsubscribeRescheduleFailed();
      unsubscribeCancelFailed();
      unsubscribeRejectFailed();
    };
  }, [
    isAuthenticated,
    user,
    handleBookingAppointment,
    handleUpdateStatus,
    handleReschedule,
    handleCancel,
    handleReject,
    handleBookingAppointmentFailed,
    handleUpdateStatusFailed,
    handleRescheduleFailed,
    handleCancelFailed,
    handleRejectFailed
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

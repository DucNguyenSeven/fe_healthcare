/**
 * usePayment Hook
 * React hook for managing payment operations
 */

import { useState, useCallback } from 'react';
import {
  createPayment as createPaymentApi,
  getPaymentStatus as getPaymentStatusApi,
  getPaymentByAppointment as getPaymentByAppointmentApi,
  pollPaymentStatus as pollPaymentStatusApi
} from '@/lib/api/payment.service';
import {
  CreatePaymentRequest,
  PaymentStatusResponse,
  PaymentState
} from '@/types/payment.types';

export interface UsePaymentReturn {
  // Payment operations
  createPayment: (data: CreatePaymentRequest) => Promise<{ paymentUrl: string; paymentId: string } | null>;
  checkPaymentStatus: (paymentId: string) => Promise<PaymentStatusResponse | null>;
  checkPaymentByAppointment: (appointmentId: string) => Promise<PaymentStatusResponse | null>;
  pollPaymentStatus: (paymentId: string, maxAttempts?: number) => Promise<PaymentStatusResponse | null>;

  // State
  loading: boolean;
  error: string | null;
  payment: PaymentStatusResponse | null;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook for payment operations
 * Provides functions to create payments, check status, and poll for updates
 */
export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);

  /**
   * Create a new payment for an appointment
   * Returns payment URL for redirect to PayOS
   */
  const createPayment = useCallback(async (
    data: CreatePaymentRequest
  ): Promise<{ paymentUrl: string; paymentId: string } | null> => {
    try {
      console.log('🔍 [usePayment] Creating payment:', data);
      setLoading(true);
      setError(null);

      const response = await createPaymentApi(data);

      // DEBUG: Log toàn bộ response từ payment service (flat structure)
      console.log('🔍 [usePayment] Payment API response (flat structure):', {
        hasPaymentId: 'paymentId' in response,
        hasPaymentUrl: 'paymentUrl' in response,
        responseKeys: Object.keys(response),
        fullResponse: response
      });

      // Check if payment was created successfully (flat structure has paymentId and paymentUrl)
      if (!response.paymentId || !response.paymentUrl) {
        throw new Error(response.message || 'Không thể tạo thanh toán');
      }

      console.log('✅ [usePayment] Payment created successfully:', {
        paymentId: response.paymentId,
        paymentUrl: response.paymentUrl,
        orderCode: response.orderCode,
        status: response.status
      });

      // Update payment state with created payment info
      const paymentInfo: PaymentStatusResponse = {
        paymentId: response.paymentId,
        appointmentId: response.appointmentId,
        orderCode: response.orderCode,
        amount: response.amount,
        status: 'PENDING',
        paymentMethod: 'BANK',
        createdAt: new Date().toISOString(),
        paidAt: null,
        expiresAt: response.expiresAt,
        transactionId: null
      };
      setPayment(paymentInfo);

      return {
        paymentUrl: response.paymentUrl,
        paymentId: response.paymentId
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tạo thanh toán';
      console.error('❌ [usePayment] Create payment failed:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check payment status by payment ID
   */
  const checkPaymentStatus = useCallback(async (
    paymentId: string
  ): Promise<PaymentStatusResponse | null> => {
    try {
      console.log('🔍 [usePayment] Checking payment status:', paymentId);
      setLoading(true);
      setError(null);

      const response = await getPaymentStatusApi(paymentId);

      if (!response.success) {
        throw new Error(response.message || 'Không thể lấy trạng thái thanh toán');
      }

      console.log('✅ [usePayment] Payment status retrieved:', {
        paymentId,
        status: response.data.status
      });

      setPayment(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi kiểm tra trạng thái thanh toán';
      console.error('❌ [usePayment] Check payment status failed:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check payment by appointment ID
   * Useful for checking if an appointment already has a payment
   */
  const checkPaymentByAppointment = useCallback(async (
    appointmentId: string
  ): Promise<PaymentStatusResponse | null> => {
    try {
      console.log('🔍 [usePayment] Checking payment by appointment:', appointmentId);
      setLoading(true);
      setError(null);

      const response = await getPaymentByAppointmentApi(appointmentId);

      if (!response.success) {
        throw new Error(response.message || 'Không tìm thấy thanh toán');
      }

      console.log('✅ [usePayment] Payment found for appointment:', {
        appointmentId,
        paymentId: response.data.paymentId,
        status: response.data.status
      });

      setPayment(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Không tìm thấy thanh toán cho lịch hẹn này';
      console.error('❌ [usePayment] Check payment by appointment failed:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Poll payment status until it's no longer PENDING
   * Used in payment return page to wait for webhook processing
   */
  const pollPaymentStatus = useCallback(async (
    paymentId: string,
    maxAttempts: number = 10
  ): Promise<PaymentStatusResponse | null> => {
    try {
      console.log('🔄 [usePayment] Polling payment status:', {
        paymentId,
        maxAttempts
      });
      setLoading(true);
      setError(null);

      const finalStatus = await pollPaymentStatusApi(paymentId, maxAttempts, 2000);

      console.log('✅ [usePayment] Payment polling completed:', {
        paymentId,
        finalStatus: finalStatus.status
      });

      setPayment(finalStatus);
      return finalStatus;
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể kiểm tra trạng thái thanh toán';
      console.error('❌ [usePayment] Poll payment status failed:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setPayment(null);
  }, []);

  return {
    createPayment,
    checkPaymentStatus,
    checkPaymentByAppointment,
    pollPaymentStatus,
    loading,
    error,
    payment,
    clearError,
    reset
  };
};

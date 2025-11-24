/**
 * Payment Service API
 * Handles payment creation and status checking via PaymentService backend
 * Base URL: http://localhost:8080 (API Gateway routes to PaymentService)
 */

import api from './client';
import {
  CreatePaymentRequest,
  CreatePaymentApiResponse,
  PaymentStatusApiResponse,
  PaymentStatusResponse
} from '@/types/payment.types';

/**
 * Create a new payment for an appointment
 * POST /api/v1/payments/create
 *
 * @param data - Payment creation request data
 * @returns Payment creation response with PayOS payment URL
 * @throws Error if payment creation fails
 */
export const createPayment = async (
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  try {
    console.log('🔍 [PaymentService] Creating payment:', {
      endpoint: '/api/v1/payments/create',
      method: 'POST',
      data
    });

    // Backend returns FLAT structure directly, not wrapped
    const response = await api.post<CreatePaymentResponse>(
      '/api/v1/payments/create',
      data
    );

    // DEBUG: Log toàn bộ response structure để kiểm tra
    console.log('🔍 [PaymentService] Raw response structure:', {
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      dataKeysDetailed: response.data ? Object.keys(response.data).map(key => ({
        key,
        value: response.data[key],
        type: typeof response.data[key]
      })) : [],
      fullResponse: response.data
    });

    // DEBUG: Log từng field cụ thể
    console.log('🔍 [PaymentService] Response fields breakdown:', {
      'response.data': response.data,
      'response.data.success': response.data?.success,
      'response.data.message': response.data?.message,
      'response.data.data': response.data?.data,
      'response.data.data.paymentId': response.data?.data?.paymentId,
      'response.data.data.paymentUrl': response.data?.data?.paymentUrl
    });

    // Backend returns WRAPPED structure - access data from response.data.data
    const paymentData = response.data.data;

    console.log('✅ [PaymentService] Payment created successfully:', {
      paymentId: paymentData.paymentId,
      orderCode: paymentData.orderCode,
      paymentUrl: paymentData.paymentUrl,
      status: paymentData.status,
      expiresAt: paymentData.expiresAt
    });

    // Return the nested data object, not the wrapper
    return paymentData;
  } catch (error: any) {
    console.error('❌ [PaymentService] Create payment error:', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      isAxiosError: error.isAxiosError
    });

    // Re-throw with enhanced error message
    const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo thanh toán. Vui lòng thử lại.';
    throw new Error(errorMessage);
  }
};

/**
 * Get payment status by payment ID
 * GET /api/v1/payments/{paymentId}
 *
 * @param paymentId - Payment ID
 * @returns Payment status information
 * @throws Error if payment not found or request fails
 */
export const getPaymentStatus = async (
  paymentId: string
): Promise<PaymentStatusApiResponse> => {
  try {
    console.log('🔍 [PaymentService] Getting payment status:', {
      endpoint: `/api/v1/payments/${paymentId}`,
      method: 'GET',
      paymentId
    });

    const response = await api.get<PaymentStatusApiResponse>(
      `/api/v1/payments/${paymentId}`
    );

    console.log('✅ [PaymentService] Payment status retrieved:', {
      paymentId,
      status: response.data.data.status,
      paidAt: response.data.data.paidAt
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [PaymentService] Get payment status error:', {
      paymentId,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message
    });

    // Re-throw with enhanced error message
    const errorMessage = error.response?.data?.message || 'Không thể lấy trạng thái thanh toán.';
    throw new Error(errorMessage);
  }
};

/**
 * Get payment information by appointment ID
 * GET /api/v1/payments/appointment/{appointmentId}
 *
 * Useful for checking if an appointment already has a payment
 *
 * @param appointmentId - Appointment ID
 * @returns Payment status information
 * @throws Error if payment not found or request fails
 */
export const getPaymentByAppointment = async (
  appointmentId: string
): Promise<PaymentStatusApiResponse> => {
  try {
    console.log('🔍 [PaymentService] Getting payment by appointment:', {
      endpoint: `/api/v1/payments/appointment/${appointmentId}`,
      method: 'GET',
      appointmentId
    });

    const response = await api.get<PaymentStatusApiResponse>(
      `/api/v1/payments/appointment/${appointmentId}`
    );

    console.log('✅ [PaymentService] Payment found for appointment:', {
      appointmentId,
      paymentId: response.data.data.paymentId,
      status: response.data.data.status
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [PaymentService] Get payment by appointment error:', {
      appointmentId,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message
    });

    // Re-throw with enhanced error message
    const errorMessage = error.response?.data?.message || 'Không tìm thấy thanh toán cho lịch hẹn này.';
    throw new Error(errorMessage);
  }
};

/**
 * Poll payment status until it changes from PENDING
 * Useful for payment return page
 *
 * @param paymentId - Payment ID to poll
 * @param maxAttempts - Maximum number of polling attempts (default: 10)
 * @param intervalMs - Interval between polls in milliseconds (default: 2000)
 * @returns Final payment status
 * @throws Error if polling fails or max attempts reached
 */
export const pollPaymentStatus = async (
  paymentId: string,
  maxAttempts: number = 10,
  intervalMs: number = 2000
): Promise<PaymentStatusResponse> => {
  console.log('🔄 [PaymentService] Starting payment status polling:', {
    paymentId,
    maxAttempts,
    intervalMs
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await getPaymentStatus(paymentId);
      const status = response.data.status;

      console.log(`🔄 [PaymentService] Poll attempt ${attempt}/${maxAttempts}:`, {
        paymentId,
        status,
        paidAt: response.data.paidAt
      });

      // If status is no longer PENDING, return immediately
      if (status !== 'PENDING') {
        console.log('✅ [PaymentService] Payment status finalized:', {
          paymentId,
          finalStatus: status,
          attempts: attempt
        });
        return response.data;
      }

      // If not the last attempt, wait before next poll
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`❌ [PaymentService] Poll attempt ${attempt} failed:`, error);

      // If it's the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Otherwise, wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  // If we reach here, max attempts were reached with status still PENDING
  console.warn('⚠️ [PaymentService] Polling max attempts reached, status still PENDING:', {
    paymentId,
    maxAttempts
  });

  // Get final status
  const finalResponse = await getPaymentStatus(paymentId);
  return finalResponse.data;
};

/**
 * Cancel a payment by order code
 * POST /api/v1/payments/cancel/orderCode/{orderCode}
 *
 * Called when user cancels payment on PayOS and is redirected back
 * This will update payment status to CANCELLED and appointment status to CANCELED
 *
 * @param orderCode - PayOS order code
 * @returns Cancel response with success status
 * @throws Error if cancellation fails
 */
export const cancelPaymentByOrderCode = async (
  orderCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 [PaymentService] Cancelling payment by orderCode:', {
      endpoint: `/api/v1/payments/cancel/orderCode/${orderCode}`,
      method: 'POST',
      orderCode
    });

    const response = await api.post<{ success: boolean; message: string }>(
      `/api/v1/payments/cancel/orderCode/${orderCode}`
    );

    console.log('✅ [PaymentService] Payment cancelled successfully:', {
      orderCode,
      response: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [PaymentService] Cancel payment error:', {
      orderCode,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data
    });

    // Re-throw with enhanced error message
    const errorMessage = error.response?.data?.message || 'Không thể hủy thanh toán. Vui lòng thử lại.';
    throw new Error(errorMessage);
  }
};

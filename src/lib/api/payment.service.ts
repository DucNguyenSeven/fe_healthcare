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
): Promise<CreatePaymentApiResponse> => {
  try {
    // Backend returns FLAT structure directly, not wrapped
    const response = await api.post<CreatePaymentApiResponse>(
      '/api/v1/payments/create',
      data
    );

    // Backend returns WRAPPED structure - access data from response.data.data
    const paymentData = response.data.data;

    // Return the full response wrapper
    return response.data;
  } catch (error: any) {

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
    const response = await api.get<PaymentStatusApiResponse>(
      `/api/v1/payments/${paymentId}`
    );

    return response.data;
  } catch (error: any) {

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
    const response = await api.get<PaymentStatusApiResponse>(
      `/api/v1/payments/appointment/${appointmentId}`
    );

    return response.data;
  } catch (error: any) {

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
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await getPaymentStatus(paymentId);
      const status = response.data.status;

      // If status is no longer PENDING, return immediately
      if (status !== 'PENDING') {
        return response.data;
      }

      // If not the last attempt, wait before next poll
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Otherwise, wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  // If we reach here, max attempts were reached with status still PENDING
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
    const response = await api.post<{ success: boolean; message: string }>(
      `/api/v1/payments/cancel/orderCode/${orderCode}`
    );

    return response.data;
  } catch (error: any) {

    // Re-throw with enhanced error message
    const errorMessage = error.response?.data?.message || 'Không thể hủy thanh toán. Vui lòng thử lại.';
    throw new Error(errorMessage);
  }
};

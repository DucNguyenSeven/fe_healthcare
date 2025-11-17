/**
 * Payment Service Type Definitions
 * Based on PaymentService backend API documentation
 */

/**
 * Payment Status Enum
 * - PENDING: Chờ thanh toán
 * - PAID: Đã thanh toán thành công
 * - EXPIRED: Hết hạn (sau 15 phút)
 * - REFUNDED: Đã hoàn tiền
 */
export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'REFUNDED';

/**
 * Payment Method Type
 * - CASH: Thanh toán tiền mặt tại phòng khám
 * - ONLINE: Thanh toán trực tuyến qua PayOS
 */
export type PaymentMethod = 'CASH' | 'ONLINE';

/**
 * Request body for creating a new payment
 * POST /api/v1/payments/create
 */
export interface CreatePaymentRequest {
  appointmentId: string;  // ID của appointment vừa tạo
  amount: number;         // Số tiền thanh toán (VNĐ)
  description?: string;   // Mô tả thanh toán (optional)
}

/**
 * Response from creating payment
 * Contains PayOS payment URL for redirect
 */
export interface CreatePaymentResponse {
  paymentId: string;      // ID của payment record
  appointmentId: string;  // ID của appointment liên kết
  orderCode: string;      // Mã đơn hàng PayOS (unique)
  paymentUrl: string;     // URL redirect đến PayOS
  amount: number;         // Số tiền
  expiresAt: string;      // Thời gian hết hạn (ISO 8601)
  status: 'PENDING';      // Status luôn là PENDING khi mới tạo
}

/**
 * API Response wrapper for create payment
 */
export interface CreatePaymentApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: CreatePaymentResponse;
}

/**
 * Payment status information
 * GET /api/v1/payments/{paymentId}
 */
export interface PaymentStatusResponse {
  paymentId: string;
  appointmentId: string;
  orderCode: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;      // "BANK_TRANSFER", "QR_CODE", etc.
  createdAt: string;          // ISO 8601
  paidAt: string | null;      // ISO 8601, null nếu chưa thanh toán
  expiresAt: string;          // ISO 8601
  transactionId: string | null; // PayOS transaction ID, null nếu chưa thanh toán
}

/**
 * API Response wrapper for payment status
 */
export interface PaymentStatusApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: PaymentStatusResponse;
}

/**
 * Payment return URL query parameters
 * Sent by PayOS after payment completion
 */
export interface PaymentReturnParams {
  orderCode: string;      // Mã đơn hàng
  status: string;         // "PAID" | "CANCELLED"
  cancel?: string;        // "true" nếu user cancel
}

/**
 * Internal payment state for UI
 */
export interface PaymentState {
  loading: boolean;
  error: string | null;
  payment: PaymentStatusResponse | null;
}

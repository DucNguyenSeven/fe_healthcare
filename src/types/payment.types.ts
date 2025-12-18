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
 * - BANK: Thanh toán chuyển khoản ngân hàng qua PayOS
 */
export type PaymentMethod = 'CASH' | 'BANK';

/**
 * Request body for creating a new payment
 * POST /api/v1/payments/create
 */
export interface CreatePaymentRequest {
  appointmentId: string;  // ID của appointment vừa tạo
  amount: number;         // Số tiền thanh toán (VNĐ)
  description?: string;   // Mô tả thanh toán (optional)
  returnUrl?: string;     // URL PayOS redirect về sau khi thanh toán thành công
  cancelUrl?: string;     // URL PayOS redirect về khi user hủy thanh toán
}

/**
 * Response from creating payment
 * Contains PayOS payment URL for redirect
 *
 * NOTE: Backend returns FLAT structure directly (không có wrapper success/code/data)
 * Backend response example:
 * {
 *   paymentId: "2082c22b-43ae-4481-a74f-6ebd1d1240bd",
 *   appointmentId: "e4300efc-7934-4e97-82c9-a5164e4473ff",
 *   orderCode: "1763438993",
 *   paymentUrl: "https://pay.payos.vn/web/...",
 *   amount: 1000,
 *   expiresAt: "2025-11-18T11:24:54.798992",
 *   status: "PENDING",
 *   message: null
 * }
 */
export interface CreatePaymentResponse {
  paymentId: string;      // ID của payment record
  appointmentId: string;  // ID của appointment liên kết
  orderCode: string;      // Mã đơn hàng PayOS (unique)
  paymentUrl: string;     // URL redirect đến PayOS
  amount: number;         // Số tiền
  expiresAt: string;      // Thời gian hết hạn (ISO 8601)
  status: 'PENDING';      // Status luôn là PENDING khi mới tạo
  message: string | null; // Message from backend (usually null on success)
}

/**
 * API Response wrapper for create payment
 * DEPRECATED: Backend thực tế trả về flat CreatePaymentResponse, không có wrapper này
 * Keeping for backwards compatibility, but CreatePaymentResponse is the actual type used
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

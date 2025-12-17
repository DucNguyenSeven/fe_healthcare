'use client';

/**
 * Payment Return Page
 * Handles PayOS payment callback after user completes/cancels payment
 *
 * Query params from PayOS:
 * - orderCode: Payment order code
 * - status: "PAID" | "CANCELLED"
 * - cancel: "true" if user cancelled
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { PaymentStatusResponse } from '@/types/payment.types';
import { motion } from 'framer-motion';

type PaymentResultStatus = 'loading' | 'success' | 'cancelled' | 'failed' | 'expired';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkPaymentStatus, pollPaymentStatus } = usePayment();

  const [status, setStatus] = useState<PaymentResultStatus>('loading');
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get query params
        const orderCode = searchParams.get('orderCode');
        const paymentStatus = searchParams.get('status');
        const isCancelled = searchParams.get('cancel') === 'true';

        // Validation
        if (!orderCode) {
          throw new Error('Không tìm thấy mã đơn hàng. Vui lòng liên hệ hỗ trợ.');
        }

        // Handle cancelled payment
        if (isCancelled || paymentStatus === 'CANCELLED') {
          setStatus('cancelled');
          setRedirectCountdown(5);
          return;
        }

        // Poll payment status from backend (wait for webhook to update)

        // We need to get paymentId from orderCode
        // Since we don't have a direct API endpoint for this, we'll need to handle this differently
        // For now, let's try to poll with a reasonable approach

        // OPTION 1: If backend can accept orderCode in the payment status endpoint
        // We would need to add a new API endpoint: /api/v1/payments/order/{orderCode}
        // For now, we'll use a simpler approach with localStorage

        const storedPaymentId = localStorage.getItem('pending_payment_id');

        if (!storedPaymentId) {
          // Fallback: just show success based on query params
          if (paymentStatus === 'PAID') {
            setStatus('success');
            setPayment({
              paymentId: 'unknown',
              appointmentId: 'unknown',
              orderCode: orderCode,
              amount: 0,
              status: 'PAID',
              paymentMethod: 'BANK',
              createdAt: new Date().toISOString(),
              paidAt: new Date().toISOString(),
              expiresAt: new Date().toISOString(),
              transactionId: null
            });
          } else {
            throw new Error('Không xác định được trạng thái thanh toán');
          }
          return;
        }

        // Poll payment status
        const paymentData = await pollPaymentStatus(storedPaymentId, 10); // 10 attempts, 2s each = 20s max

        if (!paymentData) {
          throw new Error('Không thể lấy trạng thái thanh toán. Vui lòng kiểm tra lại trong mục Lịch hẹn.');
        }

        setPayment(paymentData);

        // Clear stored paymentId
        localStorage.removeItem('pending_payment_id');

        // Set final status
        // IMPORTANT: Even if backend status is still PENDING (webhook delayed),
        // if PayOS redirected with status=PAID, we should trust that
        const isPayOSConfirmedPaid = paymentStatus === 'PAID';

        switch (paymentData.status) {
          case 'PAID':
            setStatus('success');
            break;
          case 'EXPIRED':
            setStatus('expired');
            break;
          case 'PENDING':
            // If PayOS confirmed payment but backend still PENDING (webhook delay)
            if (isPayOSConfirmedPaid) {
              setStatus('success');
              setError('Thanh toán thành công! Hệ thống đang cập nhật...');
            } else {
              // Actually still pending, treat as failed to avoid confusion
              setStatus('failed');
              setError('Thanh toán chưa hoàn tất. Vui lòng kiểm tra lại trong mục Lịch hẹn hoặc liên hệ hỗ trợ.');
            }
            break;
          default:
            setStatus('failed');
            setError('Trạng thái thanh toán không xác định');
        }
      } catch (err: any) {
        console.error('❌ [PaymentReturn] Error:', err);
        setStatus('failed');
        setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    handlePaymentReturn();
  }, [searchParams, pollPaymentStatus]);

  // Countdown timer (updates state only)
  useEffect(() => {
    if (status === 'success' || status === 'cancelled') {
      const interval = setInterval(() => {
        setRedirectCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  // Navigate when countdown reaches 0 (separate effect to avoid setState during render)
  useEffect(() => {
    if ((status === 'success' || status === 'cancelled') && redirectCountdown === 0) {
      router.push('/patient/appointments');
    }
  }, [redirectCountdown, status, router]);

  // Render different states
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Đang xử lý thanh toán</h1>
            <p className="text-gray-600 mb-2">
              Vui lòng chờ trong giây lát, chúng tôi đang kiểm tra trạng thái thanh toán của bạn...
            </p>
            {error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã hoàn tất thanh toán. Lịch hẹn của bạn đã được xác nhận.
            </p>

            {payment && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium text-gray-900">{payment.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-medium text-green-600">
                      {payment.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Đã thanh toán
                    </span>
                  </div>
                  {payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(payment.paidAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                Bác sĩ sẽ nhận được thông báo và xác nhận lịch hẹn của bạn. Bạn có thể xem chi tiết trong mục Lịch hẹn.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => router.push('/patient/appointments')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Xem lịch hẹn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-500">
                Tự động chuyển hướng sau {redirectCountdown} giây...
              </p>
            </div>
          </motion.div>
        );

      case 'cancelled':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Thanh toán đã bị hủy</h1>
            <p className="text-gray-600 mb-6">
              Bạn đã hủy thanh toán. Lịch hẹn chưa được tạo.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Nếu bạn muốn đặt lịch hẹn, vui lòng thực hiện lại từ đầu và hoàn tất thanh toán.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => router.push('/patient/appointments')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Đặt lại lịch hẹn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-500">
                Tự động chuyển hướng sau {redirectCountdown} giây...
              </p>
            </div>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Thanh toán đã hết hạn</h1>
            <p className="text-gray-600 mb-6">
              Phiên thanh toán đã hết hạn (15 phút). Lịch hẹn đã bị hủy tự động.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                Vui lòng đặt lại lịch hẹn và hoàn tất thanh toán trong vòng 15 phút.
              </p>
            </div>

            <button
              onClick={() => router.push('/patient/appointments')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Đặt lại lịch hẹn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        );

      case 'failed':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Thanh toán thất bại</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Có lỗi xảy ra trong quá trình xử lý thanh toán.'}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ nếu vấn đề vẫn tiếp diễn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/patient/appointments')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Thử lại</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/patient/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {renderContent()}
      </div>
    </div>
  );
}

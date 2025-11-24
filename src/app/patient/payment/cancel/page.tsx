'use client';

/**
 * Payment Cancel Page
 * Handles PayOS payment cancellation callback when user cancels payment
 *
 * Query params from PayOS:
 * - orderCode: Payment order code
 * - cancel: "true" to indicate cancellation
 * - status: "CANCELLED"
 * - appointmentId: Optional appointment ID for reference
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cancelPaymentByOrderCode } from '@/lib/api/payment.service';

type CancelStatus = 'processing' | 'success' | 'error';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<CancelStatus>('processing');
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [orderCode, setOrderCode] = useState<string>('');

  useEffect(() => {
    const handleCancellation = async () => {
      try {
        // Get query params from PayOS redirect
        const orderCodeParam = searchParams.get('orderCode');
        const cancel = searchParams.get('cancel');
        const paymentStatus = searchParams.get('status');

        console.log('🔍 [PaymentCancel] Query params:', {
          orderCode: orderCodeParam,
          cancel,
          status: paymentStatus
        });

        // Validation
        if (!orderCodeParam) {
          throw new Error('Không tìm thấy mã đơn hàng. Vui lòng liên hệ hỗ trợ.');
        }

        if (cancel !== 'true' && paymentStatus !== 'CANCELLED') {
          throw new Error('Dữ liệu không hợp lệ từ PayOS.');
        }

        setOrderCode(orderCodeParam);

        // Call backend API to cancel payment and update appointment
        console.log('🔄 [PaymentCancel] Calling cancel API...');
        const result = await cancelPaymentByOrderCode(orderCodeParam);

        if (result.success) {
          console.log('✅ [PaymentCancel] Payment cancelled successfully');
          setStatus('success');
          setRedirectCountdown(5);
        } else {
          throw new Error(result.message || 'Không thể hủy thanh toán');
        }
      } catch (err: any) {
        console.error('❌ [PaymentCancel] Error:', err);
        setStatus('error');
        setError(err.message || 'Có lỗi xảy ra khi hủy thanh toán');
      }
    };

    handleCancellation();
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (status === 'success') {
      const interval = setInterval(() => {
        setRedirectCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  // Navigate when countdown reaches 0
  useEffect(() => {
    if (status === 'success' && redirectCountdown === 0) {
      router.push('/patient/appointments');
    }
  }, [redirectCountdown, status, router]);

  // Render different states
  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Đang xử lý hủy thanh toán</h1>
            <p className="text-gray-600 mb-2">
              Vui lòng chờ trong giây lát, chúng tôi đang xử lý yêu cầu hủy thanh toán của bạn...
            </p>
          </motion.div>
        );

      case 'success':
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
              Bạn đã hủy thanh toán. Lịch hẹn đã được hủy tự động.
            </p>

            {orderCode && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium text-gray-900">{orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Đã hủy
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                <span>Quay lại danh sách lịch hẹn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-500">
                Tự động chuyển hướng sau {redirectCountdown} giây...
              </p>
            </div>
          </motion.div>
        );

      case 'error':
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
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Lỗi hủy thanh toán</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Có lỗi xảy ra khi xử lý yêu cầu hủy thanh toán.'}
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
                <span>Quay lại danh sách lịch hẹn</span>
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

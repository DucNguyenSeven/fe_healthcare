/**
 * AppointmentConfirmationModal Component
 * Bill review modal before final booking confirmation
 * Shows all booking info + payment method selection
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Stethoscope,
  FileText,
  CreditCard,
  DollarSign,
  Star,
  Award
} from 'lucide-react';
import { PaymentMethod } from '@/types/payment.types';

interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  avatar: string;
  examinationFee?: number;
  clinicAddress?: string;
}

interface PatientInfo {
  name: string;
  phone?: string;
  email?: string;
}

interface AppointmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  isLoading?: boolean;
  // Booking data
  doctorInfo: DoctorInfo;
  patientInfo: PatientInfo;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'direct' | 'online' | 'lab_test' | 'follow_up';
  symptoms?: string;
  note?: string;
  addressDetail?: string;
}

export const AppointmentConfirmationModal: React.FC<AppointmentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  doctorInfo,
  patientInfo,
  appointmentDate,
  appointmentTime,
  appointmentType,
  symptoms,
  note,
  addressDetail
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');

  // Map appointment type to display text
  const getAppointmentTypeText = () => {
    switch (appointmentType) {
      case 'online':
        return 'Tư vấn online';
      case 'lab_test':
        return 'Xét nghiệm';
      case 'follow_up':
        return 'Tái khám';
      case 'direct':
      default:
        return 'Khám trực tiếp';
    }
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = () => {
    switch (appointmentType) {
      case 'online':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'lab_test':
        return <Stethoscope className="w-5 h-5 text-purple-500" />;
      case 'follow_up':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'direct':
      default:
        return <MapPin className="w-5 h-5 text-green-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle confirm button
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm(selectedPaymentMethod);
    }
  };

  // Handle close button
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-2xl w-full mx-auto shadow-2xl my-8"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Xác nhận đặt lịch khám</h2>
                <p className="text-sm text-gray-600 mt-1">Vui lòng kiểm tra thông tin trước khi xác nhận</p>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Doctor Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Thông tin bác sĩ
                </h3>
                <div className="flex items-start space-x-4">
                  <img
                    src={doctorInfo.avatar || '/api/placeholder/80/80'}
                    alt={doctorInfo.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-1">{doctorInfo.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{doctorInfo.specialty}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">{doctorInfo.experience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-700">{doctorInfo.rating}</span>
                      </div>
                    </div>
                    {doctorInfo.clinicAddress && (
                      <div className="flex items-start space-x-1 mt-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{doctorInfo.clinicAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Thông tin bệnh nhân
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ và tên:</span>
                    <span className="font-medium text-gray-900">{patientInfo.name}</span>
                  </div>
                  {patientInfo.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium text-gray-900">{patientInfo.phone}</span>
                    </div>
                  )}
                  {patientInfo.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{patientInfo.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Chi tiết lịch hẹn
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ngày khám:</span>
                    <span className="font-medium text-gray-900">{formatDate(appointmentDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Giờ khám:
                    </span>
                    <span className="font-medium text-gray-900">{appointmentTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      {getAppointmentTypeIcon()}
                      <span className="ml-1">Hình thức:</span>
                    </span>
                    <span className="font-medium text-gray-900">{getAppointmentTypeText()}</span>
                  </div>
                  {addressDetail && (
                    <div className="flex items-start justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        Địa chỉ:
                      </span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{addressDetail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptoms & Notes */}
              {(symptoms || note) && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Thông tin khám bệnh
                  </h3>
                  <div className="space-y-3 text-sm">
                    {symptoms && (
                      <div>
                        <span className="text-gray-600 block mb-1">Triệu chứng:</span>
                        <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                          {symptoms}
                        </p>
                      </div>
                    )}
                    {note && (
                      <div>
                        <span className="text-gray-600 block mb-1">Ghi chú:</span>
                        <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                          {note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              {doctorInfo.examinationFee && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-700">Tổng chi phí:</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {doctorInfo.examinationFee.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Phương thức thanh toán
                </h3>
                <div className="space-y-3">
                  {/* CASH Option */}
                  <button
                    onClick={() => setSelectedPaymentMethod('CASH')}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPaymentMethod === 'CASH'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          selectedPaymentMethod === 'CASH'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPaymentMethod === 'CASH' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">Thanh toán tiền mặt</div>
                        <p className="text-sm text-gray-600">
                          Thanh toán trực tiếp tại phòng khám khi đến khám. Lịch hẹn sẽ được xác nhận ngay lập tức.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* ONLINE Option */}
                  <button
                    onClick={() => setSelectedPaymentMethod('ONLINE')}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPaymentMethod === 'ONLINE'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          selectedPaymentMethod === 'ONLINE'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPaymentMethod === 'ONLINE' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Thanh toán trực tuyến</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Khuyến nghị
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Thanh toán qua PayOS (ATM/Visa/QR). An toàn, nhanh chóng. Bác sĩ sẽ nhận thông báo sau khi thanh toán thành công.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isLoading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

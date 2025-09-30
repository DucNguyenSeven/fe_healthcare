"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Video, MapPin, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Stethoscope, Loader2, Star, Eye, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Appointment } from './HealthcarePlusApp';
import { useDoctorOfDate, useDoctorSchedule } from '@/hooks/doctor-schedules';
import { useBookingAppointment } from '@/hooks/appointments';
import { BookingAppointmentRequest } from '@/lib/api/appointments';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { usePatientAppointments, transformAppointmentToTimelineFormat } from '@/hooks/appointments/usePatientAppointments';
import { MedicalResultModal } from '@/components/MedicalResultModal';
import { useWebSocketChat } from '@/contexts/WebSocketChatContext';



interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  avatar: string;
  availableSlots?: string[];
  bio?: string;
  examinationFee?: number;
  clinicAddress?: string;
}

interface TimelineAppointment extends Appointment {
  isPast: boolean;
  isToday: boolean;
  expanded?: boolean;
}

export function AppointmentsPage() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<'all' | 'direct' | 'online' | 'lab_test' | 'follow_up'>('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // State cho Medical Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<{name: string; specialty?: string; id?: string} | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'direct' | 'online' | 'lab_test' | 'follow_up'>('direct');

  // Hook để lấy danh sách bác sĩ theo ngày
  const { doctors: availableDoctors, loading: doctorsLoading, error: doctorsError, fetchDoctorsByDate, clearError } = useDoctorOfDate();

  // Hook để lấy lịch làm việc của bác sĩ
  const { timeSlots: availableTimeSlots, scheduleId, timeSlotMapping, loading: timeSlotsLoading, error: timeSlotsError, fetchDoctorSchedule, clearError: clearTimeSlotsError } = useDoctorSchedule();

  // Hook để đặt lịch khám
  const { bookingAppointment, loading: bookingLoading, error: bookingError, clearError: clearBookingError, reset: resetBooking } = useBookingAppointment();

  // Hook để lấy thông tin user hiện tại
  const { data: currentUser } = useGetMe();

  // Hook để lấy danh sách cuộc hẹn của patient
  const {
    appointments: apiAppointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    clearError: clearAppointmentsError
  } = usePatientAppointments();

  // Hook để sử dụng WebSocket Chat
  const {
    createNewConversation,
    setActiveConversation,
    isLoading: chatLoading,
    error: chatError
  } = useWebSocketChat();

  // State để lưu thông tin cần thiết cho booking
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // State cho form thông tin chi tiết
  const [symptoms, setSymptoms] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [addressDetail, setAddressDetail] = useState<string>('');

  // State cho chat
  const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);

  // Ref để track xem đã fetch appointments chưa
  const hasInitialFetchRef = useRef(false);

  // Danh sách chi nhánh
  const branches = [
    { id: 'branch-1', name: 'Bệnh viện Đa khoa Quốc tế - Quận 1', address: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
    { id: 'branch-2', name: 'Bệnh viện Đa khoa Quốc tế - Quận 3', address: '456 Lê Văn Sỹ, Quận 3, TP.HCM' },
    { id: 'branch-3', name: 'Bệnh viện Đa khoa Quốc tế - Quận 7', address: '789 Nguyễn Thị Thập, Quận 7, TP.HCM' },
    { id: 'branch-4', name: 'Bệnh viện Đa khoa Quốc tế - Quận 10', address: '321 Sư Vạn Hạnh, Quận 10, TP.HCM' },
    { id: 'branch-5', name: 'Bệnh viện Đa khoa Quốc tế - Quận Bình Thạnh', address: '654 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM' }
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const processTimelineAppointments = (): TimelineAppointment[] => {
    // Chỉ sử dụng API data, không sử dụng mock data nữa
    const sourceAppointments = apiAppointments.map(transformAppointmentToTimelineFormat);

    return sourceAppointments.map(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return {
        ...apt,
        isPast: aptDate < today,
        isToday: aptDate.getTime() === today.getTime(),
        expanded: expandedAppointments.has(apt.id)
      };
    }).filter(apt => {
      if (appointmentTypeFilter !== 'all' && apt.type !== appointmentTypeFilter) return false;
      if (dateRange.start && new Date(apt.date) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(apt.date) > new Date(dateRange.end)) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineAppointments = processTimelineAppointments();
  const futureAppointments = timelineAppointments.filter(apt => !apt.isPast);
  const pastAppointments = timelineAppointments.filter(apt => apt.isPast);

  const toggleAppointmentExpansion = (appointmentId: string) => {
    const newExpanded = new Set(expandedAppointments);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedAppointments(newExpanded);
  };

  // Handlers cho Medical Result Modal
  const handleViewResult = (appointment: any) => {
    setSelectedAppointmentId(appointment.id);
    setSelectedDoctorInfo({
      name: appointment.doctor || 'Bác sĩ',
      specialty: appointment.specialty || undefined,
      id: appointment.doctorId || undefined
    });
    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setSelectedAppointmentId('');
    setSelectedDoctorInfo(null);
  };

  // Function để tạo tên group tự động
  const generateGroupName = () => {
    // Tạo tên group dựa trên timestamp để đảm bảo unique
    const now = new Date();
    const timestamp = now.getTime();
    const conversationNumber = Math.floor(timestamp / 1000) % 1000; // Lấy 3 số cuối của timestamp
    return `Cuộc trò chuyện ${conversationNumber}`;
  };

  // Function để bắt đầu chat với bác sĩ
  const handleStartChat = async (appointment: any) => {
    if (!currentUser) {
      toast.error('Chưa đăng nhập', {
        description: 'Vui lòng đăng nhập để sử dụng tính năng chat',
        duration: 4000,
      });
      return;
    }

    // Validation: Check if doctor info exists
    if (!appointment.doctorInfo?.doctorId || !appointment.doctorInfo?.fullName) {
      console.error('Missing doctor info:', appointment.doctorInfo);
      toast.error('Thông tin bác sĩ không đầy đủ', {
        description: 'Không thể tạo cuộc trò chuyện với bác sĩ này',
        duration: 4000,
      });
      return;
    }

    setIsCreatingChat(appointment.id);

    // Show immediate feedback
    toast.loading('Đang tạo cuộc trò chuyện...', {
      id: `creating-chat-${appointment.id}`,
      description: 'Vui lòng chờ trong giây lát',
      duration: Infinity // Will be dismissed manually
    });

    try {

      // Tạo danh sách members cho group chat với đúng structure từ API
      const members = [
        {
          userId: currentUser.userId,
          fullName: currentUser.fullName || 'Bệnh nhân',
          avatarUrl: currentUser.avatarUrl || '/api/placeholder/40/40'
        },
        {
          userId: appointment.doctorInfo.doctorId,
          fullName: appointment.doctorInfo.fullName,
          avatarUrl: appointment.doctorInfo.avatarUrl || '/api/placeholder/40/40'
        }
      ];

      // Tạo group chat với tên tự động
      const groupName = generateGroupName();

      const { groupId, isExistingGroup } = await createNewConversation(
        members,
        appointment.id, // appointmentId để liên kết
        groupName // tên group tự động
      );

      // Dismiss loading toast first
      toast.dismiss(`creating-chat-${appointment.id}`);

      // No need to call setActiveConversation here - it's already handled in createNewConversation

      // Show appropriate toast message based on whether group already exists
      if (isExistingGroup) {
        toast.success('Đã mở cuộc trò chuyện', {
          description: 'Tiếp tục trò chuyện với bác sĩ',
          duration: 3000,
        });
      } else {
        toast.success('Tạo cuộc trò chuyện thành công!', {
          description: 'Bạn có thể bắt đầu nhắn tin với bác sĩ ngay',
          duration: 3000,
        });
      }

      // ChatWidget will automatically open when activeConversation is set

    } catch (error) {
      console.error('Failed to create chat:', error);

      // Dismiss loading toast
      toast.dismiss(`creating-chat-${appointment.id}`);

      toast.error('Không thể tạo cuộc trò chuyện', {
        description: 'Vui lòng kiểm tra kết nối và thử lại',
        duration: 4000,
      });
    } finally {
      setIsCreatingChat(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    // Reset dependent fields
    setSelectedDoctor(null);
    setSelectedTime('');
    setSelectedSlotId(null);
    setSymptoms('');
    setNote('');
    setAddressDetail('');

    // Gọi API để lấy danh sách bác sĩ có lịch trong ngày này
    if (date) {
      await fetchDoctorsByDate(date);
    }
  };

  const handleDoctorChange = async (doctor: Doctor | any) => {
    // Chuyển đổi DoctorInfo thành Doctor
    const doctorData: Doctor = {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating || 4.5,
      experience: doctor.experience || '5 năm kinh nghiệm',
      avatar: doctor.avatar || '/api/placeholder/60/60',
      availableSlots: doctor.availableSlots || [],
      bio: doctor.bio,
      examinationFee: doctor.examinationFee,
      clinicAddress: doctor.clinicAddress
    };

    setSelectedDoctor(doctorData);
    // Reset dependent fields
    setSelectedTime('');
    setSelectedSlotId(null);
    setSymptoms('');
    setNote('');
    setAddressDetail('');

    // Gọi API để lấy lịch làm việc của bác sĩ trong ngày đã chọn
    if (selectedDate) {
      await fetchDoctorSchedule(doctor.id, selectedDate);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    // Lấy slotId từ mapping
    const slotId = timeSlotMapping[time];
    setSelectedSlotId(slotId || null);
  };

  const handleBookAppointment = async () => {
    // Validation đầy đủ
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Thiếu thông tin', {
        description: 'Vui lòng chọn đầy đủ thông tin: bác sĩ, ngày và giờ khám',
        duration: 4000,
      });
      return;
    }

    if (!currentUser) {
      toast.error('Chưa đăng nhập', {
        description: 'Vui lòng đăng nhập để đặt lịch',
        duration: 4000,
      });
      return;
    }

    if (!scheduleId) {
      toast.error('Lỗi lịch làm việc', {
        description: 'Không thể lấy thông tin lịch làm việc của bác sĩ. Vui lòng thử lại.',
        duration: 4000,
      });
      return;
    }

    if (!selectedSlotId) {
      toast.error('Lỗi khung giờ', {
        description: 'Không thể xác định khung giờ đã chọn. Vui lòng chọn lại giờ khám.',
        duration: 4000,
      });
      return;
    }

    try {
      // Map appointment type to consultation type - sửa để match với backend enum
      const consultationTypeMap: { [key: string]: 'ONLINE_CONSULTATION' | 'DIRECT_CONSULTATION' | 'FOLLOW_UP' } = {
        'online': 'ONLINE_CONSULTATION',
        'direct': 'DIRECT_CONSULTATION',
        'lab_test': 'DIRECT_CONSULTATION',
        'follow_up': 'FOLLOW_UP'
      };

      const bookingData: BookingAppointmentRequest = {
        patientId: currentUser.userId, // Lấy từ user hiện tại
        scheduleId: scheduleId, // Sử dụng scheduleId thực tế từ API
        doctorId: selectedDoctor.id,
        symptoms: symptoms || 'Khám theo lịch hẹn', // Sử dụng dữ liệu từ form
        note: note || `Đặt lịch ${
          appointmentType === 'online' ? 'tư vấn online' :
          appointmentType === 'lab_test' ? 'xét nghiệm' :
          appointmentType === 'follow_up' ? 'tái khám' :
          'khám trực tiếp'
        } với ${selectedDoctor.name}`, // Sử dụng dữ liệu từ form
        slotId: selectedSlotId, // Sử dụng slotId thực tế từ timeSlotMapping
        consultationType: consultationTypeMap[appointmentType] || 'DIRECT_CONSULTATION',
        status: 'CONFIRMED',
        addressDetail: appointmentType === 'online' ? 'Tại nhà' : (addressDetail || selectedDoctor.clinicAddress || branches[0].address), // Tư vấn online = Tại nhà, còn lại dùng chi nhánh đã chọn
        // Thêm các field có thể thiếu
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        patientName: currentUser.fullName || 'Bệnh nhân', // Lấy từ user hiện tại
        patientPhone: currentUser.phone || '', // Lấy từ user hiện tại
        patientEmail: currentUser.email // Lấy từ user hiện tại
      };

      const result = await bookingAppointment(bookingData);

      if (result) {
        // Reset form
        setShowBookingForm(false);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setSelectedSlotId(null);
        setSymptoms('');
        setNote('');
        setAddressDetail('');
        resetBooking();

        // Hiển thị thông báo thành công
        toast.success('Đặt lịch thành công!', {
          description: 'Bạn sẽ nhận được thông báo xác nhận qua email',
          duration: 4000,
        });

        // Refresh appointments list after successful booking
        if (currentUser?.userId) {
          const today = new Date();
          const endDate = new Date(today);
          endDate.setFullYear(today.getFullYear() + 1); // Lấy appointments trong vòng 1 năm

          fetchAppointments({
            patientId: currentUser.userId,
            startTime: '2020-01-01', // Lấy từ quá khứ để có toàn bộ lịch sử
            endTime: endDate.toISOString().split('T')[0],
            page: 0,
            size: 50,
            sortBy: 'appointmentDate',
            sortDir: 'DESC'
          });
        }
      }
    } catch (error) {
      // Error handling đã được xử lý trong hook
    }
  };

  const renderTimelineEntry = (appointment: TimelineAppointment, isLast: boolean) => {
    const StatusIcon = getStatusIcon(appointment.status);
    const isExpanded = appointment.expanded;
    return <div key={appointment.id} className="relative">
        {/* Timeline line */}
        {!isLast && <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent"></div>}

        {/* Timeline dot */}
        <div className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 ${appointment.isToday ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-200' : appointment.isPast ? 'bg-gray-300 border-gray-400' : 'bg-white border-blue-400'}`}></div>

        {/* Appointment card */}
        <div className="ml-12 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            {/* Main content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {appointment.type === 'online' ? <Video className="w-6 h-6 text-blue-500" /> :
                   appointment.type === 'lab_test' ? <Stethoscope className="w-6 h-6 text-purple-500" /> :
                   appointment.type === 'follow_up' ? <Calendar className="w-6 h-6 text-orange-500" /> :
                   appointment.type === 'direct' ? <MapPin className="w-6 h-6 text-green-500" /> :
                   <MapPin className="w-6 h-6 text-green-500" />}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{appointment.service}</h3>
                    <p className="text-gray-600">{appointment.doctor}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                  <StatusIcon className="w-4 h-4 inline mr-1" />
                  {appointment.status === 'upcoming' ? 'Sắp tới' : appointment.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                </span>
              </div>

              <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(appointment.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {appointment.status === 'upcoming' && <>
                      {appointment.canJoin && appointment.type === 'online' && <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                          Vào phòng tư vấn
                        </button>}
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        Đổi lịch
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors text-sm">
                        Hủy lịch
                      </button>
                    </>}
                  {appointment.status === 'completed' && <>
                      <button
                        onClick={() => handleViewResult(appointment)}
                        className="px-4 py-2 bg-[#1E75FF] hover:bg-[#1659C9] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Xem kết quả</span>
                      </button>
                      <button
                        onClick={() => handleStartChat(appointment)}
                        disabled={isCreatingChat === appointment.id || chatLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(isCreatingChat === appointment.id || chatLoading) ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MessageCircle size={16} />
                        )}
                        <span>
                          {(isCreatingChat === appointment.id || chatLoading) ? 'Đang tạo...' : 'Nhắn tin'}
                        </span>
                      </button>
                    </>}
                </div>

                <button onClick={() => toggleAppointmentExpansion(appointment.id)} className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin chi tiết</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">{appointment.doctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hình thức:</span>
                        <span className="font-medium">
                          {appointment.type === 'online' ? 'Tư vấn online' :
                           appointment.type === 'lab_test' ? 'Xét nghiệm' :
                           appointment.type === 'follow_up' ? 'Tái khám' :
                           appointment.type === 'direct' ? 'Khám trực tiếp' : 'Khám trực tiếp'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">30 phút</span>
                      </div>
                      {appointment.patientInfo && <div className="flex justify-between">
                        <span className="text-gray-600">Bệnh nhân:</span>
                        <span className="font-medium">{appointment.patientInfo.fullName || appointment.patientInfo.name || 'Không có thông tin'}</span>
                      </div>}
                      {appointment.patientInfo?.phone && <div className="flex justify-between">
                        <span className="text-gray-600">Số điện thoại:</span>
                        <span className="font-medium">{appointment.patientInfo.phone}</span>
                      </div>}
                      {appointment.addressDetail && <div className="flex justify-between">
                        <span className="text-gray-600">Địa chỉ khám:</span>
                        <span className="font-medium text-right max-w-48 break-words">{appointment.addressDetail}</span>
                      </div>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin khám bệnh</h4>
                    <div className="space-y-3 text-sm">
                      {appointment.symptoms && <div>
                        <span className="text-gray-600 block mb-1">Triệu chứng:</span>
                        <span className="font-medium text-gray-900 block">{appointment.symptoms}</span>
                      </div>}
                      {appointment.note && <div>
                        <span className="text-gray-600 block mb-1">Ghi chú:</span>
                        <span className="font-medium text-gray-900 block">{appointment.note}</span>
                      </div>}
                      {/* Removed result summary and action buttons for completed appointments */}
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>;
  };

  const renderBookingForm = () => <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 booking-form">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Đặt lịch hẹn mới</h3>
          <button onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Date Selection - Now shows directly */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Chọn ngày</label>
          <input type="date" value={selectedDate} onChange={e => handleDateChange(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        {/* Step 2: Doctor Selection - Only show after date is selected */}
        {selectedDate && <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Chọn bác sĩ</label>

            {/* Loading state */}
            {doctorsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Đang tải danh sách bác sĩ...</span>
              </div>
            )}

            {/* Error state */}
            {doctorsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{doctorsError}</span>
                </div>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Doctors list */}
            {!doctorsLoading && !doctorsError && (
              <div className="space-y-3">
                {availableDoctors.length > 0 ? (
                  availableDoctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorChange(doctor)}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all ${selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={doctor.avatar || '/api/placeholder/60/60'}
                          alt={doctor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{doctor.name}</h5>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{doctor.rating || '4.5'}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{doctor.experience || '5 năm kinh nghiệm'}</span>
                          </div>
                          {doctor.examinationFee && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              Phí khám: {doctor.examinationFee.toLocaleString('vi-VN')}đ
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Không có bác sĩ nào có lịch làm việc trong ngày này</p>
                    <p className="text-sm mt-1">Vui lòng chọn ngày khác</p>
                  </div>
                )}
              </div>
            )}
          </div>}

        {/* Step 3: Time Selection - Only show after doctor is selected */}
        {selectedDate && selectedDoctor && <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Chọn giờ</label>

            {/* Loading state */}
            {timeSlotsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Đang tải lịch làm việc...</span>
              </div>
            )}

            {/* Error state */}
            {timeSlotsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{timeSlotsError}</span>
                </div>
                <button
                  onClick={clearTimeSlotsError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Time slots */}
            {!timeSlotsLoading && !timeSlotsError && (
              <div className="grid grid-cols-8 gap-2">
                {(() => {
                  // Tạo danh sách tất cả khung giờ trong ngày (8:00 - 17:30)
                  const allTimeSlots = [];
                  for (let hour = 8; hour <= 17; hour++) {
                    for (let minute = 0; minute < 60; minute += 30) {
                      if (hour === 17 && minute > 0) break; // Dừng ở 17:30
                      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      allTimeSlots.push(timeString);
                    }
                  }

                  // Đảm bảo availableTimeSlots là array
                  const safeAvailableTimeSlots = Array.isArray(availableTimeSlots) ? availableTimeSlots : [];

                  return allTimeSlots.map(time => {
                    const isAvailable = safeAvailableTimeSlots.includes(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && handleTimeChange(time)}
                        disabled={!isAvailable}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : isAvailable
                              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                              : 'border border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>}

        {/* Step 4: Appointment Type - Only show after time is selected */}
        {selectedDate && selectedDoctor && selectedTime && <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Hình thức khám</label>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setAppointmentType('direct')} className={`p-4 border-2 rounded-xl transition-all ${appointmentType === 'direct' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <span className="font-medium">Khám trực tiếp</span>
              </button>
              <button onClick={() => setAppointmentType('online')} className={`p-4 border-2 rounded-xl transition-all ${appointmentType === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Video className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <span className="font-medium">Tư vấn online</span>
              </button>
              <button onClick={() => setAppointmentType('lab_test')} className={`p-4 border-2 rounded-xl transition-all ${appointmentType === 'lab_test' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Stethoscope className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <span className="font-medium">Xét nghiệm</span>
              </button>
              <button onClick={() => setAppointmentType('follow_up')} className={`p-4 border-2 rounded-xl transition-all ${appointmentType === 'follow_up' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <span className="font-medium">Tái khám</span>
              </button>
            </div>
          </div>}

        {/* Step 5: Thông tin chi tiết - Only show after appointment type is selected */}
        {selectedDate && selectedDoctor && selectedTime && appointmentType && <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Thông tin chi tiết</label>
            <div className="space-y-4">
              {/* Triệu chứng */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Triệu chứng <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Mô tả các triệu chứng bạn đang gặp phải..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {symptoms.length}/500 ký tự
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Ghi chú thêm <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thông tin bổ sung về tình trạng sức khỏe, tiền sử bệnh, dị ứng thuốc..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={1000}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {note.length}/1000 ký tự
                </div>
              </div>

              {/* Địa chỉ - chỉ hiển thị cho khám trực tiếp, tái khám, xét nghiệm */}
              {(appointmentType === 'direct' || appointmentType === 'follow_up' || appointmentType === 'lab_test') && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Chọn chi nhánh khám <span className="text-gray-400">(Tùy chọn)</span>
                  </label>
                  <select
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn chi nhánh khám</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.address}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Địa chỉ mặc định cho online */}
              {appointmentType === 'online' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Tư vấn online</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Cuộc gọi video sẽ được thực hiện qua ứng dụng. Bạn sẽ nhận được link tham gia trước giờ hẹn.
                  </p>
                </div>
              )}
            </div>
          </div>}

        {/* Booking Error Display */}
        {bookingError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{bookingError}</span>
            </div>
            <button
              onClick={clearBookingError}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Submit Button - Only show when all required fields are filled */}
        {selectedDate && selectedDoctor && selectedTime && appointmentType && <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowBookingForm(false)} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={bookingLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{bookingLoading ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}</span>
            </button>
          </div>}
      </div>
    </div>;

  // Effect để fetch appointments khi component mount hoặc currentUser thay đổi
  useEffect(() => {
    if (currentUser?.userId && !hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;

      const today = new Date();
      const endDate = new Date(today);
      endDate.setFullYear(today.getFullYear() + 1); // Lấy appointments trong vòng 1 năm

      fetchAppointments({
        patientId: currentUser.userId,
        startTime: '2020-01-01', // Lấy từ quá khứ để có toàn bộ lịch sử
        endTime: endDate.toISOString().split('T')[0],
        page: 0,
        size: 50,
        sortBy: 'appointmentDate',
        sortDir: 'DESC'
      });
    }
  }, [currentUser?.userId, fetchAppointments]);

  useEffect(() => {
    // Kiểm tra nếu có dữ liệu từ CKD prediction
    const predictionData = localStorage.getItem('ckd_prediction_result');
    if (predictionData) {
      try {
        // Auto-open booking form
        setShowBookingForm(true);

        // Auto scroll đến section booking sau một chút delay
        setTimeout(() => {
          const bookingSection = document.querySelector('.booking-form');
          if (bookingSection) {
            bookingSection.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 500);

        // Clear localStorage sau khi đã sử dụng
        localStorage.removeItem('ckd_prediction_result');
      } catch (error) {
        // Error parsing CKD prediction data
      }
    }
  }, []);

  return <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header with filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử khám bệnh</h1>
            <p className="text-gray-600 mt-2">Theo dõi lịch trình khám bệnh theo thời gian</p>
          </div>
          <button onClick={() => setShowBookingForm(true)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <span>Đặt lịch mới</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({
              ...prev,
              start: e.target.value
            }))} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({
              ...prev,
              end: e.target.value
            }))} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
              <select value={appointmentTypeFilter} onChange={e => setAppointmentTypeFilter(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Tất cả</option>
                <option value="direct">Khám trực tiếp</option>
                <option value="online">Tư vấn online</option>
                <option value="lab_test">Xét nghiệm</option>
                <option value="follow_up">Tái khám</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      {showBookingForm && renderBookingForm()}

      {/* Loading state */}
      {appointmentsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Đang tải lịch sử khám bệnh...</span>
        </div>
      )}

      {/* Error state */}
      {appointmentsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">Không thể tải lịch sử khám bệnh</h3>
              <p className="text-red-600 mt-1">{appointmentsError}</p>
            </div>
          </div>
          <button
            onClick={clearAppointmentsError}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Timeline */}
      {!appointmentsLoading && !appointmentsError && (
        <div className="space-y-0">
          {/* Future appointments */}
          {futureAppointments.length > 0 && <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">Lịch hẹn sắp tới</h2>
              </div>
              {futureAppointments.map((appointment, index) => renderTimelineEntry(appointment, index === futureAppointments.length - 1))}
            </div>}

        {/* Today marker */}
        <div className="relative mb-12">
          <div className="absolute left-4 w-4 h-4 bg-blue-500 rounded-full border-4 border-blue-100 shadow-lg"></div>
          <div className="ml-12 flex items-center space-x-3">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent flex-1"></div>
            <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
              Hôm nay
            </span>
            <div className="h-0.5 bg-gradient-to-l from-blue-500 to-transparent flex-1"></div>
          </div>
        </div>

        {/* Past appointments */}
        {pastAppointments.length > 0 && <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Lịch sử khám bệnh</h2>
            </div>
            {pastAppointments.map((appointment, index) => renderTimelineEntry(appointment, index === pastAppointments.length - 1))}
          </div>}

        {/* Empty state - only show when no appointments from API and no mock data */}
        {timelineAppointments.length === 0 && !appointmentsLoading && <div className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có lịch hẹn nào</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bắt đầu hành trình chăm sóc sức khỏe của bạn bằng cách đặt lịch hẹn đầu tiên
            </p>
            <button onClick={() => setShowBookingForm(true)} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Đặt lịch ngay
            </button>
          </div>}
        </div>
      )}

      {/* Medical Result Modal */}
      <MedicalResultModal
        isOpen={showResultModal}
        onClose={handleCloseResultModal}
        appointmentId={selectedAppointmentId}
        patientInfo={{
          name: currentUser?.fullName || 'Bệnh nhân',
          id: currentUser?.userId || '',
          phone: currentUser?.phone || '',
          email: currentUser?.email || ''
        }}
        doctorInfo={selectedDoctorInfo ?? undefined}
      />
    </div>;
}
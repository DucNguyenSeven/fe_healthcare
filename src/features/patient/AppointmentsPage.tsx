"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, User, Video, MapPin, Phone, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronLeft, Plus, Filter, Search, Edit3, Trash2, CreditCard, FileText, Star, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import { Appointment } from './HealthcarePlusApp';
interface AppointmentsPageProps {
  appointments: Appointment[];
}
interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  type: 'direct' | 'online' | 'both';
  category: 'consultation' | 'checkup' | 'specialist';
}
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  avatar: string;
  availableSlots: string[];
}
interface TimelineAppointment extends Appointment {
  isPast: boolean;
  isToday: boolean;
  expanded?: boolean;
}
export function AppointmentsPage({
  appointments
}: AppointmentsPageProps) {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<'all' | 'direct' | 'online'>('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'direct' | 'online'>('direct');
  const [showCKDNotification, setShowCKDNotification] = useState(false);
  const [ckdPredictionData, setCkdPredictionData] = useState<any>(null);
  const services: Service[] = [{
    id: '1',
    name: 'Tư vấn thận học',
    description: 'Tư vấn chuyên khoa về các vấn đề liên quan đến thận',
    duration: '30 phút',
    price: '500.000đ',
    type: 'both',
    category: 'specialist'
  }, {
    id: 'ckd-specialist',
    name: 'Khám chuyên khoa Thận - Tiết niệu',
    description: 'Theo dõi và điều trị bệnh thận mạn (CKD)',
    duration: '45 phút',
    price: '400.000đ',
    type: 'both',
    category: 'specialist'
  }, {
    id: '2',
    name: 'Khám tổng quát',
    description: 'Khám sức khỏe tổng quát và tư vấn chế độ sinh hoạt',
    duration: '45 phút',
    price: '300.000đ',
    type: 'direct',
    category: 'checkup'
  }, {
    id: '3',
    name: 'Tư vấn dinh dưỡng',
    description: 'Tư vấn chế độ ăn uống phù hợp với bệnh thận',
    duration: '30 phút',
    price: '200.000đ',
    type: 'both',
    category: 'consultation'
  }, {
    id: '4',
    name: 'Theo dõi định kỳ',
    description: 'Khám theo dõi tình trạng bệnh định kỳ',
    duration: '20 phút',
    price: '250.000đ',
    type: 'both',
    category: 'checkup'
  }];
  const doctors: Doctor[] = [{
    id: '1',
    name: 'BS. Trần Minh Hoàng',
    specialty: 'Thận học',
    rating: 4.9,
    experience: '15 năm',
    avatar: '/api/placeholder/60/60',
    availableSlots: ['09:00', '10:30', '14:00', '15:30']
  }, {
    id: '2',
    name: 'BS. Lê Thị Mai',
    specialty: 'Nội tổng quát',
    rating: 4.8,
    experience: '12 năm',
    avatar: '/api/placeholder/60/60',
    availableSlots: ['08:30', '11:00', '13:30', '16:00']
  }, {
    id: '3',
    name: 'BS. Nguyễn Văn Đức',
    specialty: 'Dinh dưỡng',
    rating: 4.7,
    experience: '8 năm',
    avatar: '/api/placeholder/60/60',
    availableSlots: ['09:30', '11:30', '14:30', '16:30']
  }];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const processTimelineAppointments = (): TimelineAppointment[] => {
    return appointments.map(apt => {
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
  const handleBookAppointment = () => {
    // Booking appointment with data
    const appointmentData = {
      service: selectedService,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType
    };
    setShowBookingForm(false);
    // Reset form
    setSelectedService(null);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
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
                  {appointment.type === 'online' ? <Video className="w-6 h-6 text-blue-500" /> : <MapPin className="w-6 h-6 text-green-500" />}
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
                  {appointment.status === 'completed' && <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                      Xem kết quả
                    </button>}
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
                        <span className="text-gray-600">Loại dịch vụ:</span>
                        <span className="font-medium">{appointment.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">{appointment.doctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hình thức:</span>
                        <span className="font-medium">
                          {appointment.type === 'online' ? 'Tư vấn online' : 'Khám trực tiếp'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">30 phút</span>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.status === 'completed' && <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Kết quả khám</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">Tình trạng sức khỏe ổn định. Tiếp tục theo dõi định kỳ.</p>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors">
                            Tải đơn thuốc
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-colors">
                            Xem báo cáo
                          </button>
                        </div>
                      </div>
                    </div>}
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
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Chọn dịch vụ</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map(service => <button key={service.id} onClick={() => setSelectedService(service)} className={`p-4 text-left border-2 rounded-xl transition-all ${selectedService?.id === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <span className="text-sm font-semibold text-blue-600">{service.price}</span>
                </div>
                <p className="text-sm text-gray-600">{service.description}</p>
              </button>)}
          </div>
        </div>

        {selectedService && <>
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Chọn bác sĩ</label>
              <div className="space-y-3">
                {doctors.map(doctor => <button key={doctor.id} onClick={() => setSelectedDoctor(doctor)} className={`w-full p-4 text-left border-2 rounded-xl transition-all ${selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center space-x-4">
                      <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{doctor.name}</h5>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                  </button>)}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Chọn ngày</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              
              {selectedDoctor && selectedDate && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Chọn giờ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDoctor.availableSlots.map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        {time}
                      </button>)}
                  </div>
                </div>}
            </div>

            {/* Appointment Type */}
            {selectedService.type === 'both' && <div>
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
                </div>
              </div>}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowBookingForm(false)} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleBookAppointment} disabled={!selectedService || !selectedDoctor || !selectedDate || !selectedTime} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Xác nhận đặt lịch
              </button>
            </div>
          </>}
      </div>
    </div>;
  useEffect(() => {
    // Kiểm tra nếu có dữ liệu từ CKD prediction
    const predictionData = localStorage.getItem('ckd_prediction_result');
    if (predictionData) {
      try {
        const parsedData = JSON.parse(predictionData);
        setCkdPredictionData(parsedData);
        setShowCKDNotification(true);

        // Auto-select dịch vụ CKD
        const ckdService = services.find(s => s.id === 'ckd-specialist');
        if (ckdService) {
          setSelectedService(ckdService);
        }

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
  const scrollToBottom = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  return <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header with filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử khám bệnh</h1>
            <p className="text-gray-600 mt-2">Theo dõi lịch trình khám bệnh theo thời gian</p>
          </div>
          <button onClick={() => setShowBookingForm(true)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
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
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      {showBookingForm && renderBookingForm()}

      {/* Timeline */}
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

        {/* Empty state */}
        {timelineAppointments.length === 0 && <div className="text-center py-16">
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
    </div>;
}
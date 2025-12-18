import { User, Appointment, HealthMetric, Alert } from '@/features/patient/HealthcarePlusApp';

// Mock user data for development
export const mockUser: User = {
  id: '1',
  name: 'Nguyễn Văn A',
  avatar: '/assets/images/avatar-placeholder.png',
  email: 'user@example.com',
  phone: '0123456789',
  ckdStage: 3,
  lastEgfr: 45,
  lastCreatinine: 1.8,
  lastBp: '140/90'
};

// Mock appointments for development
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    type: 'direct',
    service: 'Khám thận định kỳ',
    doctor: 'BS. Nguyễn Thanh Hải',
    date: '2024-12-20',
    time: '09:00',
    status: 'upcoming',
    canJoin: false
  },
  {
    id: '2',
    type: 'online',
    service: 'Tư vấn dinh dưỡng',
    doctor: 'BS. Lê Thị Mai',
    date: '2024-12-18',
    time: '14:30',
    status: 'upcoming',
    canJoin: true
  },
  {
    id: '3',
    type: 'direct',
    service: 'Xét nghiệm máu',
    doctor: 'BS. Trần Văn Nam',
    date: '2024-12-15',
    time: '08:00',
    status: 'completed'
  }
];

// Mock health metrics for development
export const mockHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    type: 'egfr',
    value: 45,
    date: '2024-12-10',
    unit: 'mL/min/1.73m²',
    isAlert: true
  },
  {
    id: '2',
    type: 'creatinine',
    value: 1.8,
    date: '2024-12-10',
    unit: 'mg/dL',
    isAlert: false
  },
  {
    id: '3',
    type: 'bp',
    value: '140/90',
    date: '2024-12-08',
    unit: 'mmHg',
    isAlert: true
  },
  {
    id: '4',
    type: 'weight',
    value: 68,
    date: '2024-12-08',
    unit: 'kg',
    isAlert: false
  }
];

// Mock alerts for development
export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Chỉ số eGFR thấp',
    message: 'Chỉ số eGFR của bạn đã giảm xuống 45. Vui lòng liên hệ bác sĩ ngay.',
    date: '2024-12-10',
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Huyết áp cao',
    message: 'Huyết áp 140/90 cao hơn mức khuyến nghị. Theo dõi thường xuyên.',
    date: '2024-12-08',
    isRead: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Nhắc nhở uống thuốc',
    message: 'Đã đến giờ uống thuốc huyết áp buổi sáng.',
    date: '2024-12-12',
    isRead: true
  }
];

import { 
  User, 
  Appointment, 
  HealthMetric, 
  Consultation, 
  MedicationReminder, 
  Article 
} from '@/features/patient';
import { Alert } from '@/features/patient';

export const mockUser: User = {
  id: '1',
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@email.com',
  phone: '0123456789',
  avatar: '/api/placeholder/40/40',
  ckdStage: 3,
  lastEgfr: 45,
  lastCreatinine: 1.8,
  lastBp: '140/90'
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    type: 'online',
    service: 'Tư vấn thận học',
    doctor: 'BS. Trần Minh Hoàng',
    date: '2024-01-15',
    time: '14:00',
    status: 'upcoming',
    canJoin: true
  },
  {
    id: '2',
    type: 'direct',
    service: 'Khám tổng quát',
    doctor: 'BS. Lê Thị Mai',
    date: '2024-01-20',
    time: '09:30',
    status: 'upcoming'
  }
];

export const mockHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    type: 'egfr',
    value: 45,
    date: '2024-01-10',
    unit: 'mL/min/1.73m²',
    isAlert: true
  },
  {
    id: '2',
    type: 'creatinine',
    value: 1.8,
    date: '2024-01-10',
    unit: 'mg/dL',
    isAlert: true
  },
  {
    id: '3',
    type: 'bp',
    value: '140/90',
    date: '2024-01-10',
    unit: 'mmHg'
  },
  {
    id: '4',
    type: 'weight',
    value: 65,
    date: '2024-01-10',
    unit: 'kg'
  }
];

export const mockConsultations: Consultation[] = [
  {
    id: '1',
    doctor: 'BS. Trần Minh Hoàng',
    service: 'Tư vấn thận học - 12/01/2024',
    date: '2024-01-12',
    type: 'video'
  },
  {
    id: '2',
    doctor: 'BS. Lê Thị Mai',
    service: 'Khám tổng quát - 08/01/2024',
    date: '2024-01-08',
    type: 'document'
  }
];

export const mockMedicationReminders: MedicationReminder[] = [
  {
    id: '1',
    name: 'Losartan 50mg',
    dosage: '50mg',
    time: '8:00 AM',
    isTaken: false
  },
  {
    id: '2',
    name: 'Furosemide 40mg',
    dosage: '40mg',
    time: '6:00 AM',
    isTaken: true
  }
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Chế độ ăn cho người bệnh thận mạn',
    excerpt: 'Hướng dẫn chi tiết về chế độ dinh dưỡng phù hợp...',
    image: '/api/placeholder/300/200',
    readTime: '5 phút đọc'
  },
  {
    id: '2',
    title: 'Tập thể dục an toàn với CKD',
    excerpt: 'Các bài tập phù hợp cho từng giai đoạn bệnh...',
    image: '/api/placeholder/300/200',
    readTime: '7 phút đọc'
  },
  {
    id: '3',
    title: 'Hiểu về chỉ số eGFR',
    excerpt: 'Ý nghĩa và cách theo dõi chỉ số quan trọng này...',
    image: '/api/placeholder/300/200',
    readTime: '4 phút đọc'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Chỉ số eGFR thấp',
    message: 'eGFR 45 mL/min/1.73m² - dưới ngưỡng an toàn. Vui lòng liên hệ bác sĩ.',
    date: '2024-01-10',
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Huyết áp cao',
    message: 'Huyết áp 140/90 mmHg - vượt ngưỡng khuyến nghị.',
    date: '2024-01-10',
    isRead: false
  }
];



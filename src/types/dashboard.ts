/**
 * Dashboard Types for Patient Dashboard
 * Includes health metrics with kidney disease severity classification
 */

// ==================== Health Metrics ====================

/**
 * Mức độ sức khỏe thận (Kidney Health Level)
 * Dựa trên tiêu chuẩn y khoa về bệnh thận mạn (CKD)
 */
export type KidneyHealthLevel = 'NORMAL' | 'WARNING' | 'DANGER' | 'CRITICAL';

/**
 * Trạng thái cảnh báo cho mỗi chỉ số
 */
export interface MetricAlert {
  level: KidneyHealthLevel;
  label: string; // "Bình thường", "Cảnh báo", "Nguy hiểm", "Rất nguy hiểm"
  color: string; // Tailwind color classes
  bgColor: string; // Background color
  textColor: string; // Text color
  iconColor: string; // Icon color
}

/**
 * Chỉ số sức khỏe từ API
 */
export interface HealthMetricResponse {
  metricId: string;
  patientId: string;
  metricName: string; // "eGFR", "Creatinine", "Blood Pressure", "Weight"
  metricValue: number;
  unit: string;
  medicalRecordId?: string;
  measuredAt: string;
}

/**
 * Chỉ số sức khỏe đã được xử lý với thông tin cảnh báo
 */
export interface HealthMetricLatest extends HealthMetricResponse {
  displayName: string; // Tên hiển thị tiếng Việt
  alert: MetricAlert;
  formattedValue: string; // Giá trị đã format (VD: "140/90 mmHg")
}

/**
 * Chỉ số sức khỏe với thông tin so sánh tháng trước
 * Extends HealthMetricLatest để có đầy đủ thông tin hiển thị + so sánh
 */
export interface HealthMetricWithComparison extends HealthMetricLatest {
  // Thông tin so sánh với tháng trước
  previousMonthValue?: number;
  previousMonthDate?: string; // ISO date string
  changePercentage?: number; // % thay đổi (số âm = giảm, số dương = tăng)
  changeDirection?: 'up' | 'down' | 'stable';
  isTrendGood?: boolean; // Xu hướng tốt hay xấu (phụ thuộc loại chỉ số)

  // Ngưỡng bình thường để hiển thị
  normalRange?: {
    min?: number;
    max?: number;
    description: string; // VD: "≥90 ml/min" hoặc "8.5-10.5 mg/dL"
  };

  // So sánh với mức bình thường (THÊM MỚI)
  exceedancePercentage?: number;     // % vượt/thiếu so với ngưỡng
  exceedanceStatus?: 'over' | 'under' | 'normal';
  exceedanceMessage?: string;        // "Vượt mức bình thường 76.9%"
}

/**
 * Response từ API get-health-metrics-latest
 */
export interface GetLatestHealthMetricsResponse {
  code: number;
  message: string;
  success: boolean;
  data: HealthMetricResponse[];
}

// ==================== Prescription Groups ====================

/**
 * Tần suất uống thuốc
 */
export type MedicationFrequency = 'MORNING' | 'AFTERNOON' | 'EVENING';

/**
 * Thông tin đơn thuốc
 */
export interface PrescriptionItem {
  prescriptionId: string;
  medicalName: string;  // Backend DTO field (matches CreatePrescriptionRequest and response)
  dosage: string;
  frequency: MedicationFrequency[];
  notes?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Nhóm toa thuốc theo lần khám
 */
export interface PrescriptionGroup {
  medicalRecordId: string;
  doctorId: string;
  doctorName: string;
  createdDate: string;
  appointmentDate?: string | null;
  diagnosis: string;
  serviceName: string;
  isActive: boolean; // true nếu còn thuốc chưa hết hạn
  totalMedicines: number;
  prescriptions: PrescriptionItem[];
}

/**
 * Response từ API prescriptions/groups
 */
export interface GetPrescriptionGroupsResponse {
  code: number;
  message: string;
  success: boolean;
  data: PrescriptionGroup[];
}

// ==================== Appointments ====================

/**
 * Thông tin bác sĩ trong lịch hẹn
 */
export interface DoctorInfo {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
}

/**
 * Thông tin bệnh nhân trong lịch hẹn
 */
export interface PatientInfo {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
}

/**
 * Time slot
 */
export interface TimeSlot {
  slotId: number;
  startTime: string; // "09:00:00"
  endTime: string; // "09:30:00"
}

/**
 * Trạng thái lịch hẹn
 */
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Loại tư vấn
 */
export type ConsultationType = 'ONLINE' | 'OFFLINE' | 'PHONE';

/**
 * Lịch hẹn hôm nay
 */
export interface TodayAppointment {
  appointmentId: string;
  doctor: DoctorInfo;
  patient: PatientInfo;
  symptoms?: string;
  note?: string;
  status: AppointmentStatus;
  timeSlot: TimeSlot;
  appointmentDate: string; // "2024-01-15"
  consultationType: ConsultationType;
  addressDetail?: string;
  hasPredict?: boolean;
}

/**
 * Response từ API get-appointment-with-patientId
 */
export interface GetTodayAppointmentsResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    content: TodayAppointment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

// ==================== Recent Consultations ====================

/**
 * Tư vấn/Hồ sơ bệnh án gần đây
 */
export interface RecentConsultation {
  recordId: string;
  doctorName: string;
  serviceName: string;
  createdAt: string;
  diagnosis: string;
}

/**
 * Response từ API medical-records/patient/{patientId}
 */
export interface GetRecentConsultationsResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    records: RecentConsultation[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// ==================== Helper Functions ====================

/**
 * Phân loại mức độ nguy hiểm dựa trên eGFR (chỉ số lọc cầu thận)
 * Theo tiêu chuẩn CKD (Chronic Kidney Disease):
 * - Stage 1: eGFR ≥ 90 (Bình thường hoặc cao)
 * - Stage 2: eGFR 60-89 (Giảm nhẹ - Cảnh báo)
 * - Stage 3: eGFR 30-59 (Giảm vừa đến nặng - Nguy hiểm)
 * - Stage 4-5: eGFR < 30 (Suy thận nặng - Rất nguy hiểm)
 */
export function getEGFRAlert(value: number): MetricAlert {
  if (value >= 90) {
    return {
      level: 'NORMAL',
      label: 'Bình thường',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    };
  } else if (value >= 60) {
    return {
      level: 'WARNING',
      label: 'Cảnh báo',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    };
  } else if (value >= 30) {
    return {
      level: 'DANGER',
      label: 'Nguy hiểm',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-500'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'Rất nguy hiểm',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    };
  }
}

/**
 * Phân loại mức độ nguy hiểm dựa trên Creatinine
 * Giá trị bình thường:
 * - Nam: 0.7-1.3 mg/dL
 * - Nữ: 0.6-1.1 mg/dL
 * (Sử dụng ngưỡng chung để đơn giản)
 */
export function getCreatinineAlert(value: number): MetricAlert {
  if (value <= 1.3) {
    return {
      level: 'NORMAL',
      label: 'Bình thường',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    };
  } else if (value <= 2.0) {
    return {
      level: 'WARNING',
      label: 'Cảnh báo',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    };
  } else if (value <= 4.0) {
    return {
      level: 'DANGER',
      label: 'Nguy hiểm',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-500'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'Rất nguy hiểm',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    };
  }
}

/**
 * Phân loại huyết áp
 * Lấy giá trị tâm thu (systolic - số trên)
 */
export function getBloodPressureAlert(systolic: number): MetricAlert {
  if (systolic < 120) {
    return {
      level: 'NORMAL',
      label: 'Bình thường',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    };
  } else if (systolic < 140) {
    return {
      level: 'WARNING',
      label: 'Cảnh báo',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    };
  } else if (systolic < 180) {
    return {
      level: 'DANGER',
      label: 'Nguy hiểm',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-500'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'Rất nguy hiểm',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    };
  }
}

/**
 * Phân loại BUN (Ure máu / Blood Urea Nitrogen)
 * Giá trị bình thường: 7-20 mg/dL
 * Giá trị cao cho thấy chức năng thận giảm
 */
export function getBUNAlert(value: number): MetricAlert {
  if (value >= 7 && value <= 20) {
    return {
      level: 'NORMAL',
      label: 'Bình thường',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    };
  } else if (value > 20 && value <= 30) {
    return {
      level: 'WARNING',
      label: 'Cảnh báo',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    };
  } else if (value > 30 && value <= 50) {
    return {
      level: 'DANGER',
      label: 'Nguy hiểm',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-500'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'Rất nguy hiểm',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    };
  }
}

/**
 * Phân loại Canxi máu (Serum Calcium)
 * Giá trị bình thường: 8.5-10.5 mg/dL
 * Cả tăng và giảm canxi đều có thể nguy hiểm
 */
export function getCalciumAlert(value: number): MetricAlert {
  if (value >= 8.5 && value <= 10.5) {
    return {
      level: 'NORMAL',
      label: 'Bình thường',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    };
  } else if ((value >= 8.0 && value < 8.5) || (value > 10.5 && value <= 11.0)) {
    return {
      level: 'WARNING',
      label: 'Cảnh báo',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    };
  } else if ((value >= 7.0 && value < 8.0) || (value > 11.0 && value <= 12.0)) {
    return {
      level: 'DANGER',
      label: 'Nguy hiểm',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-500'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'Rất nguy hiểm',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    };
  }
}

/**
 * Lấy ngưỡng bình thường cho từng chỉ số
 */
export function getMetricNormalRange(metricName: string): {
  min?: number;
  max?: number;
  description: string;
} {
  const normalized = metricName.toLowerCase();

  if (normalized.includes('egfr') || normalized === 'gfr') {
    return { min: 90, description: '≥90 ml/min' };
  }

  if (normalized.includes('creatinine') || normalized === 'serum_creatinine') {
    return { max: 1.3, description: '≤1.3 mg/dL' };
  }

  if (normalized.includes('bun') || normalized.includes('ure')) {
    return { min: 7, max: 20, description: '7-20 mg/dL' };
  }

  if (normalized.includes('canxi') || normalized.includes('calcium')) {
    return { min: 8.5, max: 10.5, description: '8.5-10.5 mg/dL' };
  }

  return { description: 'Tùy theo tiêu chuẩn lâm sàng' };
}

/**
 * Chuyển đổi tần suất uống thuốc sang tiếng Việt
 */
export function translateFrequency(frequency: MedicationFrequency): string {
  const mapping: Record<MedicationFrequency, string> = {
    MORNING: 'Sáng',
    AFTERNOON: 'Trưa',
    EVENING: 'Tối'
  };
  return mapping[frequency] || frequency;
}

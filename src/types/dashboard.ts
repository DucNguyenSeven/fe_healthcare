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
  medicalName: string;
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

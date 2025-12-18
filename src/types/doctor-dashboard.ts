/**
 * TypeScript Type Definitions for Doctor Dashboard API
 * Endpoint: GET /api/v1/dashboard/doctor/{doctorId}?date=YYYY-MM-DD
 */

// ==================== Appointment Status Enum ====================

/**
 * Trạng thái lịch hẹn (Appointment Status)
 * Enum từ backend API
 */
export enum AppointmentStatus {
  PENDING = "PENDING",           // Chờ xác nhận
  CONFIRMED = "CONFIRMED",       // Đã xác nhận
  COMPLETED = "COMPLETED",       // Hoàn thành
  CANCELED = "CANCELED",         // Đã hủy
  REJECTED = "REJECTED",         // Bị từ chối
  NO_SHOW = "NO_SHOW",          // Không đến
  RESCHEDULED = "RESCHEDULED"   // Đã dời lịch
}

// ==================== Dashboard Statistics ====================

/**
 * Thống kê tổng quan dashboard bác sĩ
 */
export interface DashboardStatisticsDTO {
  todayAppointments: number;       // Tổng lịch hẹn hôm nay
  newPatients: number;             // Bệnh nhân mới (lần đầu đặt lịch)
  completedConsultations: number;  // Tư vấn đã hoàn thành
  totalPatients: number;           // Tổng số bệnh nhân từ trước đến nay
}

// ==================== Upcoming Appointments ====================

/**
 * Lịch hẹn sắp tới trong ngày
 */
export interface UpcomingAppointmentDTO {
  appointmentId: string;         // UUID của appointment
  time: string;                  // Thời gian (format: "HH:mm" - VD: "09:00")
  patientName: string;           // Tên bệnh nhân
  consultationType: string;      // Loại tư vấn (tiếng Việt từ backend)
  status: AppointmentStatus;     // Trạng thái appointment
}

// ==================== Recent Patients ====================

/**
 * Bệnh nhân gần đây đã khám
 */
export interface RecentPatientDTO {
  patientId: string;      // UUID của bệnh nhân
  patientName: string;    // Tên bệnh nhân
  diagnosis: string;      // Chẩn đoán
  timeAgo: string;        // Thời gian từ lần khám (VD: "2 giờ trước", "1 ngày trước")
}

// ==================== Dashboard Response ====================

/**
 * Response chính từ dashboard API
 */
export interface DoctorDashboardResponse {
  statistics: DashboardStatisticsDTO;
  upcomingAppointments: UpcomingAppointmentDTO[];
  recentPatients: RecentPatientDTO[];
}

/**
 * API Response Wrapper (MessageResponse format)
 */
export interface DoctorDashboardApiResponse {
  status: number;        // HTTP status code (200)
  message: string;       // "Lấy thông tin dashboard thành công"
  success: boolean;      // true
  data: DoctorDashboardResponse;
}

// ==================== Status & Type Mappings ====================

/**
 * Config cho hiển thị trạng thái appointment
 * Mapping status enum sang label tiếng Việt và màu sắc Tailwind
 */
export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string }
> = {
  [AppointmentStatus.PENDING]: {
    label: 'Chờ xác nhận',
    color: 'bg-[#F59E0B]/10 text-[#F59E0B]'
  },
  [AppointmentStatus.CONFIRMED]: {
    label: 'Đã xác nhận',
    color: 'bg-[#10B981]/10 text-[#10B981]'
  },
  [AppointmentStatus.COMPLETED]: {
    label: 'Hoàn thành',
    color: 'bg-[#1E75FF]/10 text-[#1E75FF]'
  },
  [AppointmentStatus.CANCELED]: {
    label: 'Đã hủy',
    color: 'bg-gray-400/10 text-gray-600'
  },
  [AppointmentStatus.REJECTED]: {
    label: 'Bị từ chối',
    color: 'bg-[#EF4444]/10 text-[#EF4444]'
  },
  [AppointmentStatus.NO_SHOW]: {
    label: 'Không đến',
    color: 'bg-[#F59E0B]/10 text-[#F59E0B]'
  },
  [AppointmentStatus.RESCHEDULED]: {
    label: 'Đã dời lịch',
    color: 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
  }
};

/**
 * Mapping consultation type (nếu API trả về English enum)
 * Hiện tại API đã trả về tiếng Việt, giữ lại để backup
 */
export const CONSULTATION_TYPE_MAPPING: Record<string, string> = {
  'DIRECT_CONSULTATION': 'Khám trực tiếp',
  'ONLINE_CONSULTATION': 'Tư vấn trực tuyến',
  'LAB_TEST': 'Xét nghiệm',
  'FOLLOW_UP': 'Tái khám'
};

/**
 * Helper function: Lấy label và color cho status
 */
export function getAppointmentStatusDisplay(status: AppointmentStatus) {
  return APPOINTMENT_STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-gray-400/10 text-gray-600'
  };
}

/**
 * Helper function: Translate consultation type nếu cần
 */
export function translateConsultationType(type: string): string {
  return CONSULTATION_TYPE_MAPPING[type] || type;
}

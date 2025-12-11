// Medical Record Types based on database schema

export interface MedicalRecord {
  recordId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  serviceName?: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  doctorNote?: string;
  followUpDate?: string | null;
  appointmentDate?: string; // The actual appointment date (added by backend)
  imageAttachments?: string[];
  signature?: string | null; // Contains doctor's full name (not an image URL)
  stage?: number;
  statusHealth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  prescriptionId: string;
  medicalRecordId: string;
  medicalName: string;  // Backend DTO field (matches CreatePrescriptionRequest and response)
  dosage: string;
  frequency: string[] | string; // Support both array and string format
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInfo {
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface MedicalRecordWithPrescriptions extends MedicalRecord {
  prescriptions: Prescription[];
  patient?: PatientInfo;
}

// API Response Types
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export interface GetMedicalRecordsResponse {
  records: MedicalRecordWithPrescriptions[];
  pagination: PaginationData;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// API Request Params
export interface GetMedicalRecordsParams {
  patientId: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'appointmentDate';
  order?: 'ASC' | 'DESC';
}

// Mock data types
export interface MockMedicalRecord {
  recordId: string;
  appointmentId: string;
  appointmentDate: string;
  doctorName: string;
  serviceName: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  doctorNote: string;
  followUpDate: string | null;
  prescriptions: MockPrescription[];
  createdAt: string;
}

export interface MockPrescription {
  prescriptionId: string;
  medicalName: string;  // Backend DTO field (matches CreatePrescriptionRequest and response)
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

// ==================== NEW: Full Timeline with Episodes Types ====================

/**
 * Response từ API GET /medical-records/{recordId}/full-timeline
 */
export interface MedicalRecordFullTimelineResponse {
  totalVisits: number;
  totalEpisodes: number;
  episodes: EpisodeGroup[];
}

/**
 * Episode Group - Đợt điều trị (bao gồm khám ban đầu + các lần tái khám)
 */
export interface EpisodeGroup {
  episodeId: string;              // Root record ID
  isCurrentEpisode: boolean;      // True nếu episode này chứa cuộc khám hiện tại
  firstVisitDate: string;         // ISO date string - Ngày khám lần đầu của episode
  totalVisitsInEpisode: number;   // Tổng số lần khám trong episode này
  serviceName: string;            // Tên dịch vụ/chuyên khoa
  rootDiagnosis: string;          // Chẩn đoán của lần khám đầu tiên
  visits: VisitDetail[];          // Danh sách các lần khám (sorted DESC - mới nhất trước)
}

/**
 * Visit Detail - Chi tiết một lần khám
 */
export interface VisitDetail {
  recordId: string;
  appointmentId: string;
  appointmentDate: string;        // ISO date string
  episodeType: 'INITIAL' | 'FOLLOW_UP';
  parentRecordId: string | null;  // Null nếu là INITIAL, có giá trị nếu là FOLLOW_UP
  isCurrentVisit: boolean;        // True nếu đây là cuộc khám đang xem
  diagnosis: string;
  symptoms: string;
  treatment: string;
  doctorNote: string;
  serviceName: string;
  visitNumberInEpisode: number;   // Số thứ tự trong episode (1, 2, 3...)
  prescriptions: PrescriptionResponse[];
  createdAt: string;              // ISO date string
}

/**
 * Prescription Response từ full timeline API
 */
export interface PrescriptionResponse {
  prescriptionId: string;
  medicalName: string;
  dosage: string;
  frequency: string;              // Comma-separated: "MORNING,AFTERNOON,EVENING"
  notes?: string;
}

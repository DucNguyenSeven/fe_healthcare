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
  imageAttachments?: string[];
  signatureUrl?: string | null;
  stage?: number;
  statusHealth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  prescriptionId: string;
  medicalRecordId: string;
  medicalName: string;
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
  medicalName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

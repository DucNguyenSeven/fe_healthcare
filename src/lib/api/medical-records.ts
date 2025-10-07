import api from './client';
import type {
  MedicalRecordWithPrescriptions,
  Prescription,
  GetMedicalRecordsParams,
  GetMedicalRecordsResponse,
  ApiResponse
} from '@/types/medical-record';

// Types for Create (existing)
export interface CreateMedicalRecordRequest {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  serviceName?: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  doctorNote?: string;
  followUpDate?: string;
  imageAttachments?: string[];
  signatureUrl?: string;
  stage?: number;
  statusHealth?: string;
}

export interface CreateMedicalRecordResponse {
  recordId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  serviceName?: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  doctorNote?: string;
  followUpDate?: string;
  imageAttachments?: string[];
  signatureUrl?: string;
  stage?: number;
  statusHealth?: string;
  createdAt: string;
  updatedAt: string;
}

// ================== API Functions ==================

/**
 * Create a new medical record (existing)
 */
export const createMedicalRecord = async (
  data: CreateMedicalRecordRequest
): Promise<ApiResponse<CreateMedicalRecordResponse>> => {
  try {
    const response = await api.post('/api/v1/medical-records/create', data);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo hồ sơ khám',
    };
  }
};

/**
 * Get medical records by patient ID with pagination
 */
export const getMedicalRecordsByPatientId = async (
  params: GetMedicalRecordsParams
): Promise<ApiResponse<GetMedicalRecordsResponse>> => {
  try {
    const { patientId, page = 0, size = 20, sortBy = 'createdAt', order = 'DESC' } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      order,
    });

    const response = await api.get<ApiResponse<GetMedicalRecordsResponse>>(
      `/api/v1/medical-records/patient/${patientId}?${queryParams.toString()}`
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải danh sách hồ sơ khám',
    };
  }
};

/**
 * Get medical record detail by record ID
 */
export const getMedicalRecordById = async (
  recordId: string
): Promise<ApiResponse<MedicalRecordWithPrescriptions>> => {
  try {
    const response = await api.get<ApiResponse<MedicalRecordWithPrescriptions>>(
      `/api/v1/medical-records/${recordId}`
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải thông tin hồ sơ khám',
    };
  }
};

/**
 * Get prescriptions by medical record ID
 */
export const getPrescriptionsByRecordId = async (
  medicalRecordId: string
): Promise<ApiResponse<Prescription[]>> => {
  try {
    const response = await api.get<ApiResponse<Prescription[]>>(
      `/api/v1/prescriptions/medical-record/${medicalRecordId}`
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải danh sách đơn thuốc',
    };
  }
};
import api from './client';

// Types
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
  stage?: number;
  statusHealth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// API Functions
export const createMedicalRecord = async (
  data: CreateMedicalRecordRequest
): Promise<ApiResponse<CreateMedicalRecordResponse>> => {
  try {
    const response = await api.post('/api/v1/medical-records/create', data);
    return {
      success: true,
      data: response.data.data, // Lấy data.data thay vì data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo hồ sơ khám',
    };
  }
};
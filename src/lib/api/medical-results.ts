import api from './client';

// Types
export interface MedicalRecord {
  recordId: string;
  appointmentId: string;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  doctorNote?: string;
  followUpDate?: string;
  serviceName?: string;
  statusHealth?: string;
  signatureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  prescriptionId: string;
  medicalRecordId: string;
  medicalName: string;
  dosage: string;
  frequency: string[];
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalResultsData {
  medicalRecord: MedicalRecord;
  prescriptions: Prescription[];
}

export interface MedicalResultsResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: MedicalResultsData;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// API Functions
export const getMedicalResultsByAppointment = async (
  appointmentId: string
): Promise<ApiResponse<MedicalResultsData>> => {
  try {
    const response = await api.get<MedicalResultsResponse>(`/api/v1/medical-results/appointment/${appointmentId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lấy kết quả khám',
    };
  }
};

import api from './client';
import type { GetPrescriptionGroupsResponse } from '@/types/dashboard';

// Types
export interface CreatePrescriptionRequest {
  medicalRecordId: string;
  medicalName: string;  // Backend DTO field is camelCase (matches Java naming)
  dosage: string;
  frequency: string[];
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface CreatePrescriptionResponse {
  prescriptionId: string;
  medicalRecordId: string;
  medicalName: string;  // Backend DTO field is camelCase
  dosage: string;
  frequency: string[];
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// API Functions
export const createPrescription = async (
  data: CreatePrescriptionRequest
): Promise<ApiResponse<CreatePrescriptionResponse>> => {
  try {
    console.log('🔍 [API - createPrescription] Request data:', data);
    console.log('🔍 [API - createPrescription] Field check:', {
      has_medical_name: 'medical_name' in data,
      medical_name_value: (data as any).medical_name,
      has_medicationName: 'medicationName' in data,
      medicationName_value: (data as any).medicationName,
      all_keys: Object.keys(data)
    });
    const response = await api.post('/api/v1/prescriptions/create', data);
    console.log('✅ [API - createPrescription] Response:', response.data);
    return {
      success: true,
      data: response.data.data, // Lấy data.data thay vì data
    };
  } catch (error: any) {
    console.error('❌ [API - createPrescription] Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn thuốc',
    };
  }
};

// Helper function để tạo nhiều prescriptions
export const createMultiplePrescriptions = async (
  prescriptions: CreatePrescriptionRequest[]
): Promise<{
  successful: CreatePrescriptionResponse[];
  failed: { data: CreatePrescriptionRequest; error: string }[];
}> => {
  const results = await Promise.allSettled(
    prescriptions.map(prescription => createPrescription(prescription))
  );

  const successful: CreatePrescriptionResponse[] = [];
  const failed: { data: CreatePrescriptionRequest; error: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success && result.value.data) {
      successful.push(result.value.data);
    } else {
      const errorMessage = result.status === 'fulfilled'
        ? result.value.message || 'Không thể tạo đơn thuốc'
        : 'Lỗi mạng khi tạo đơn thuốc';

      failed.push({
        data: prescriptions[index],
        error: errorMessage
      });
    }
  });

  return { successful, failed };
};

/**
 * Lấy danh sách toa thuốc nhóm theo lần khám
 * API: GET /api/v1/prescriptions/groups/{patientId}
 */
export const getPrescriptionGroups = async (
  patientId: string
): Promise<GetPrescriptionGroupsResponse> => {
  try {
    const response = await api.get<GetPrescriptionGroupsResponse>(
      `/api/v1/prescriptions/groups/${patientId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching prescription groups:', error);
    throw {
      code: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Không thể tải danh sách toa thuốc',
      success: false,
      data: []
    };
  }
};
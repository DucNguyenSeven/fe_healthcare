import api from './client';

// Types
export interface CreatePrescriptionRequest {
  medicalRecordId: string;
  medicalName: string;
  dosage: string;
  frequency: string[];
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface CreatePrescriptionResponse {
  prescriptionId: string;
  medicalRecordId: string;
  medicalName: string;
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
    const response = await api.post('/api/v1/prescriptions/create', data);
    return {
      success: true,
      data: response.data.data, // Lấy data.data thay vì data
    };
  } catch (error: any) {
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
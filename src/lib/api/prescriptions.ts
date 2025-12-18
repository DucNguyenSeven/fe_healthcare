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
    const response = await api.post('/api/v1/prescriptions/create', data);
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
    throw {
      code: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Không thể tải danh sách toa thuốc',
      success: false,
      data: []
    };
  }
};

/**
 * Response type cho download PDF
 */
export interface DownloadPDFResponse {
  blob: Blob;
  filename: string;
}

/**
 * Download đơn thuốc dưới dạng PDF
 * API: GET /api/v1/prescriptions/download/{recordId}
 * @param recordId - ID của medical record
 * @returns Object chứa blob và filename từ Content-Disposition header
 */
export const downloadPrescriptionPDF = async (
  recordId: string
): Promise<DownloadPDFResponse> => {
  const response = await api.get(
    `/api/v1/prescriptions/download/${recordId}`,
    {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }
  );

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let filename = `don-thuoc-${recordId}.pdf`; // fallback

  if (contentDisposition) {
    // Try RFC 2231 format first: filename*=UTF-8''encoded-name
    const rfc2231Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (rfc2231Match && rfc2231Match[1]) {
      filename = decodeURIComponent(rfc2231Match[1]);
    } else {
      // Try standard format: filename="name" or filename=name
      const standardMatch = contentDisposition.match(/filename="?([^";\n]+)"?/i);
      if (standardMatch && standardMatch[1]) {
        let extractedName = standardMatch[1].trim();

        // Decode MIME encoded-word if present: =?UTF-8?Q?...?=
        const mimeMatch = extractedName.match(/=\?UTF-8\?Q\?(.+)\?=/i);
        if (mimeMatch && mimeMatch[1]) {
          // Decode quoted-printable: replace _ with space, decode %XX
          extractedName = mimeMatch[1]
            .replace(/_/g, ' ')
            .replace(/=([0-9A-F]{2})/g, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
        }

        filename = extractedName;
      }
    }
  }

  return {
    blob: response.data,
    filename
  };
};
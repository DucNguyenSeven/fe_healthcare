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
  signatureUrl?: string; // Doctor's full name
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
  signatureUrl?: string; // Doctor's full name
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

// ==================== NEW APIs for Follow-up Management ====================

/**
 * Episode Type enum
 */
export type EpisodeType = 'INITIAL' | 'FOLLOW_UP';

/**
 * Medical Record with Episode info
 */
export interface MedicalRecordWithEpisode extends MedicalRecordWithPrescriptions {
  parentRecordId?: string | null;
  episodeType?: EpisodeType;
  relatedRecordId?: string | null;
}

/**
 * Timeline Response structure
 */
export interface MedicalRecordTimelineResponse {
  rootRecord: MedicalRecordWithEpisode;
  followUpRecords: MedicalRecordWithEpisode[];
}

/**
 * Get medical record timeline (full history from root to all follow-ups)
 * Can be called with any recordId in the chain, always returns full timeline
 * @param recordId - ID of any medical record in the chain (INITIAL or FOLLOW_UP)
 * @returns Timeline with root record and all follow-up records
 */
export const getMedicalRecordTimeline = async (
  recordId: string
): Promise<ApiResponse<MedicalRecordTimelineResponse>> => {
  try {
    console.log('🔍 [API - getMedicalRecordTimeline] Fetching timeline for record:', recordId);

    const response = await api.get<ApiResponse<MedicalRecordTimelineResponse>>(
      `/api/v1/medical-records/${recordId}/timeline`
    );

    console.log('🔍 [API - getMedicalRecordTimeline] Response:', {
      rootRecordId: response.data.data?.rootRecord?.recordId,
      followUpCount: response.data.data?.followUpRecords?.length || 0
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('🔍 [API] Get timeline error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải lịch sử khám',
    };
  }
};

/**
 * Get patient episodes (only INITIAL records)
 * Used for displaying clean list of main examination episodes
 * @param patientId - Patient ID
 * @param page - Page number (default 0)
 * @param size - Page size (default 20)
 * @param sortBy - Sort field (default 'createdAt')
 * @param order - Sort order 'ASC' | 'DESC' (default 'DESC')
 */
export const getPatientEpisodes = async (params: {
  patientId: string;
  page?: number;
  size?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}): Promise<ApiResponse<GetMedicalRecordsResponse>> => {
  try {
    const {
      patientId,
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      order = 'DESC'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      order,
    });

    console.log('🔍 [API - getPatientEpisodes] Fetching episodes for patient:', patientId);

    const response = await api.get<ApiResponse<GetMedicalRecordsResponse>>(
      `/api/v1/medical-records/patient/${patientId}/episodes?${queryParams.toString()}`
    );

    console.log('🔍 [API - getPatientEpisodes] Response:', {
      totalRecords: response.data.data?.pagination?.totalRecords,
      currentPage: response.data.data?.pagination?.currentPage
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('🔍 [API] Get episodes error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải danh sách đợt khám',
    };
  }
};
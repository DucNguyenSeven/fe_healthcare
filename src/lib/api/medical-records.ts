import api from './client';
import type {
  MedicalRecordWithPrescriptions,
  Prescription,
  GetMedicalRecordsParams,
  GetMedicalRecordsResponse,
  ApiResponse,
  MedicalRecordFullTimelineResponse
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

    // Log để kiểm tra xem backend có trả về appointmentDate không
    console.log('🔍 [API - getMedicalRecordsByPatientId] Response:', {
      totalRecords: response.data.data?.records?.length || 0,
      firstRecord: response.data.data?.records?.[0] ? {
        recordId: response.data.data.records[0].recordId,
        appointmentDate: response.data.data.records[0].appointmentDate,
        createdAt: response.data.data.records[0].createdAt,
        hasAppointmentDate: !!response.data.data.records[0].appointmentDate
      } : 'No records'
    });

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

    // Log để kiểm tra xem backend có trả về appointmentDate không
    console.log('🔍 [API - getMedicalRecordById] Response:', {
      recordId: response.data.data?.recordId,
      appointmentDate: response.data.data?.appointmentDate,
      createdAt: response.data.data?.createdAt,
      hasAppointmentDate: !!response.data.data?.appointmentDate
    });

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

/**
 * Get full medical history with episodes grouping
 * NEW API for full timeline with episodes
 * @param recordId - Medical record ID
 * @returns Promise<MedicalRecordFullTimelineResponse>
 * @throws Error if request fails
 */
export const getFullTimeline = async (
  recordId: string
): Promise<ApiResponse<MedicalRecordFullTimelineResponse>> => {
  try {
    console.log('🔍 [API - getFullTimeline] Fetching full timeline for record:', recordId);

    const response = await api.get<ApiResponse<MedicalRecordFullTimelineResponse>>(
      `/api/v1/medical-records/${recordId}/full-timeline`
    );

    console.log('🔍 [API - getFullTimeline] Response:', {
      totalVisits: response.data.data?.totalVisits || 0,
      totalEpisodes: response.data.data?.totalEpisodes || 0,
      episodesCount: response.data.data?.episodes?.length || 0
    });

    // Assuming response structure: { code, message, success, data }
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    throw new Error(response.data.message || 'Failed to fetch full timeline');
  } catch (error: any) {
    console.error('🔍 [API] Get full timeline error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải lịch sử khám đầy đủ',
    };
  }
};

// ==================== NEW: Medical History API for Doctor ====================

/**
 * Medical history record with prescriptions (for doctor view)
 */
export interface MedicalHistoryRecord {
  recordId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patient: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  serviceName: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  doctorNote: string;
  followUpDate: string | null;
  imageAttachments: string[];
  signatureUrl: string | null;
  stage: number | null;
  statusHealth: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentDate: string;
  prescriptions: PrescriptionWithDuration[];
  parentRecordId: string | null;
  episodeType: 'INITIAL' | 'FOLLOW_UP' | null;
}

/**
 * Prescription with duration info
 */
export interface PrescriptionWithDuration {
  prescriptionId: string;
  medicalName: string;
  dosage: string;
  frequency: string[]; // ["MORNING", "AFTERNOON", "EVENING"]
  notes: string;
  duration: string; // "30 ngày"
  startDate: string;
  endDate: string;
}

/**
 * Query params for medical history
 */
export interface GetMedicalHistoryParams {
  doctorId: string;
  patientId: string;
  page?: number;
  size?: number;
}

/**
 * Medical history response with pagination
 */
export interface MedicalHistoryResponse {
  content: MedicalHistoryRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Get medical history for patient (doctor view)
 * Used for Tab 3 (Consultations) and Tab 4 (Treatment Plan)
 *
 * @param params - doctorId, patientId, page, size
 * @returns Promise<ApiResponse<MedicalHistoryResponse>>
 *
 * @example
 * const data = await getMedicalHistoryByDoctor({
 *   doctorId: 'DOC123',
 *   patientId: 'PAT456',
 *   page: 0,
 *   size: 50
 * });
 */
export const getMedicalHistoryByDoctor = async (
  params: GetMedicalHistoryParams
): Promise<ApiResponse<MedicalHistoryResponse>> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }

    const queryString = queryParams.toString();
    const url = `/api/v1/medical-records/doctor/${params.doctorId}/patient/${params.patientId}/history${queryString ? '?' + queryString : ''}`;

    console.log('🔍 [Medical History API] Fetching consultation history:', {
      endpoint: url,
      fullURL: `${url}`,
      doctorId: params.doctorId,
      patientId: params.patientId,
      page: params.page,
      size: params.size,
      timestamp: new Date().toISOString()
    });

    const response = await api.get<ApiResponse<MedicalHistoryResponse>>(url);

    console.log('✅ [Medical History API] Success - Response received:', {
      totalRecords: response.data.data?.totalElements || 0,
      totalPages: response.data.data?.totalPages || 0,
      recordsCount: response.data.data?.content?.length || 0,
      firstRecord: response.data.data?.content?.[0] ? {
        appointmentDate: response.data.data.content[0].appointmentDate,
        diagnosis: response.data.data.content[0].diagnosis,
        hasSymptoms: !!response.data.data.content[0].symptoms,
        hasTreatment: !!response.data.data.content[0].treatment,
        serviceName: response.data.data.content[0].serviceName
      } : null,
      timestamp: new Date().toISOString()
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [Medical History API] Error fetching consultation history:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      errorData: error.response?.data,
      doctorId: params.doctorId,
      patientId: params.patientId,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tải lịch sử khám',
    };
  }
};
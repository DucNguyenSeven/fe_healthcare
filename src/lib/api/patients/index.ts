/**
 * Patient API Service
 * Handles API calls for patient management by doctors
 */

import api from '../client';

// ==================== Types ====================

export interface PatientListItem {
  patientId: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  lastVisitDate: string; // format: "dd/MM/yyyy"
}

export interface PatientProfile {
  patientId: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  dob: string; // format: "dd/MM/yyyy"
  phone: string;
  email: string;
  address: string;
  bloodType: string | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
}

export interface GetPatientsListParams {
  doctorId: string;
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  namePatient?: string;
}

export interface PaginationResponse {
  content: PatientListItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// ==================== API Functions ====================

/**
 * Get patient list by doctor ID
 *
 * @param params - Query parameters including doctorId, pagination, sorting
 * @returns Promise<ApiResponse<PaginationResponse>> - Paginated list of patients
 *
 * @example
 * const data = await getPatientsListByDoctorId({
 *   doctorId: 'DOC123',
 *   page: 0,
 *   size: 20,
 *   sortBy: 'lastVisitDate',
 *   sortDir: 'DESC',
 *   namePatient: 'Nguyen'
 * });
 */
export const getPatientsListByDoctorId = async (
  params: GetPatientsListParams
): Promise<ApiResponse<PaginationResponse>> => {
  try {
    // Validate page number to prevent negative index
    if (params.page < 0) {
      throw new Error('Page index cannot be negative');
    }

    // WORKAROUND: Backend may expect 1-indexed pages (page starts from 1, not 0)
    // Spring Data's Pageable by default is 0-indexed, but custom validation might reject 0
    // Try converting to 1-indexed: page 0 → 1, page 1 → 2, etc.
    const backendPage = params.page;  // Keep 0-indexed for now, backend should fix validation

    const queryParams = new URLSearchParams({
      doctorId: params.doctorId,
      page: backendPage.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    });

    // Add optional namePatient parameter if provided
    if (params.namePatient) {
      queryParams.append('namePatient', params.namePatient);
    }

    console.log('🔍 [Patient API] Fetching simple patients:', {
      doctorId: params.doctorId,
      frontendPage: params.page,
      backendPage: backendPage,
      pageIsValid: params.page >= 0,
      size: params.size,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      namePatient: params.namePatient,
      fullQueryString: queryParams.toString()
    });

    const response = await api.get<ApiResponse<PaginationResponse>>(
      `/api/v1/patients/getPatientsListByDoctorId?${queryParams.toString()}`
    );

    console.log('✅ [Patient API] Success:', {
      totalElements: response.data.data.totalElements,
      totalPages: response.data.data.totalPages,
      currentPage: response.data.data.number
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [Patient API] Error fetching patients:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.response?.data
    });
    throw error;
  }
};

/**
 * Get patient profile by doctor and patient ID
 *
 * @param doctorId - Doctor's user ID
 * @param patientId - Patient's user ID
 * @returns Promise<ApiResponse<PatientProfile>> - Patient profile details
 *
 * @example
 * const data = await getPatientProfile('DOC123', 'PAT456');
 */
export const getPatientProfile = async (
  doctorId: string,
  patientId: string
): Promise<ApiResponse<PatientProfile>> => {
  try {
    console.log('🔍 [Patient API] Fetching patient profile:', {
      doctorId,
      patientId
    });

    const response = await api.get<ApiResponse<PatientProfile>>(
      `/api/v1/patients/doctor/${doctorId}/patient/${patientId}/profile`
    );

    console.log('✅ [Patient API] Profile success:', {
      patientId: response.data.data.patientId,
      fullName: response.data.data.fullName
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [Patient API] Error fetching profile:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.response?.data
    });
    throw error;
  }
};

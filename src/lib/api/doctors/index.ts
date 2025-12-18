import api from '../client';
import type { MessageResponse } from '../types';
import type { Certification } from '../certification';

// Interface cho DoctorResponse từ API getDoctorById
export interface DoctorResponse {
  userId: string;
  fullName: string;
  email: string;
  gender: string | null;
  dob: string | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  // Thông tin chuyên môn
  specialty?: string | null;
  experienceYears?: number | null;
  examinationFee?: number | null;
  clinicAddress?: string | null;
  bio?: string | null;
  rating?: number;
  certifications?: Certification[];
}

export interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  avatar: string;
  bio?: string;
  examinationFee?: number;
  clinicAddress?: string;
  // Thêm các field từ API getDoctorByIds
  userId?: string;
  fullName?: string;
  email?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role?: string;
  status?: string;
  experienceYears?: number;
  certifications?: any[];
}

export interface GetDoctorInfoResponse {
  success: boolean;
  message: string;
  data: DoctorInfo;
}

export interface GetDoctorsInfoResponse {
  success: boolean;
  message: string;
  data: DoctorInfo[];
}

/**
 * Lấy thông tin chi tiết của một bác sĩ theo ID
 * @param doctorId - ID của bác sĩ
 * @returns Promise<GetDoctorInfoResponse>
 */
export const getDoctorInfo = async (doctorId: string): Promise<GetDoctorInfoResponse> => {
  const response = await api.get<GetDoctorInfoResponse>(
    `/api/v1/doctors/${doctorId}`
  );
  
  return response.data;
};

/**
 * Lấy thông tin chi tiết của nhiều bác sĩ theo danh sách ID
 * @param doctorIds - Danh sách ID của các bác sĩ
 * @returns Promise<GetDoctorsInfoResponse>
 */
export const getDoctorsInfo = async (doctorIds: string[]): Promise<GetDoctorsInfoResponse> => {
  const doctorIdsParam = doctorIds.join(',');
  
  const response = await api.get<GetDoctorsInfoResponse>(
    `/api/v1/doctors/getDoctorByIds`,
    {
      params: {
        doctorIds: doctorIdsParam
      }
    }
  );
  
  return response.data;
};

/**
 * Lấy thông tin đầy đủ của bác sĩ theo ID (bao gồm thông tin chuyên môn và certifications)
 * @param doctorId - ID của bác sĩ
 * @returns Promise<MessageResponse<DoctorResponse>>
 */
export const getDoctorById = async (doctorId: string): Promise<MessageResponse<DoctorResponse>> => {
  const response = await api.get<MessageResponse<DoctorResponse>>(
    `/api/v1/doctors/getDoctorById/${encodeURIComponent(doctorId)}`
  );
  return response.data;
};

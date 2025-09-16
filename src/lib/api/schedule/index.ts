// Schedule Service API endpoints
import { api } from '../client';
import type {
  MessageResponse,
  CreateDoctorScheduleRequest,
  BulkCreateDoctorScheduleRequest,
  DoctorScheduleResponse,
  GetDoctorScheduleRequest,
  GetDoctorsOfDateRequest
} from '../types';

export const SCHEDULE_API_BASE = process.env.NEXT_PUBLIC_SCHEDULE_API_URL;

// Doctor Schedule API
export class DoctorScheduleApi {
  // Tạo lịch làm việc đơn lẻ
  static async create(data: CreateDoctorScheduleRequest): Promise<MessageResponse<DoctorScheduleResponse>> {
    const response = await api.post('/api/v1/doctor-schedules/create', data);
    return response.data;
  }

  // Tạo lịch làm việc hàng loạt
  static async bulkCreate(data: BulkCreateDoctorScheduleRequest): Promise<MessageResponse<DoctorScheduleResponse[]>> {
    const response = await api.post('/api/v1/doctor-schedules/bulk-create', data);
    return response.data;
  }

  // Lấy lịch làm việc của bác sĩ theo ngày
  static async getDoctorScheduleByDate(params: GetDoctorScheduleRequest): Promise<MessageResponse<DoctorScheduleResponse>> {
    const response = await api.get('/api/v1/doctor-schedules/getDoctorScheduleByDoctorIdAndDate', {
      params: {
        doctorId: params.doctorId,
        date: params.date
      }
    });
    return response.data;
  }

  // Lấy danh sách bác sĩ có lịch trong ngày
  static async getDoctorsOfDate(params: GetDoctorsOfDateRequest): Promise<MessageResponse<string[]>> {
    const response = await api.get('/api/v1/doctor-schedules/getDoctorOfDate', {
      params: {
        date: params.date
      }
    });
    
    return response.data;
  }
}

// Legacy function for backwards compatibility
export async function getAppointments(userId: string) {
  // TODO: Implement appointments fetch if needed
  throw new Error('Not implemented yet');
}

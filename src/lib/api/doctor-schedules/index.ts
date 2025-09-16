import api from '../client';

export interface GetDoctorOfDateResponse {
  success: boolean;
  message: string;
  data: string[]; // Array of doctor IDs
}

export interface GetDoctorOfDateParams {
  date: string; // Format: yyyy-MM-dd
}

export interface TimeSlot {
  slotId: number;
  startTime: string;
  endTime: string;
}

export interface DoctorScheduleResponse {
  scheduleId: string;
  doctorId: string;
  weekDay: string;
  workDate: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface GetDoctorScheduleResponse {
  message: string;
  data: DoctorScheduleResponse;
  status: string;
}

export interface GetDoctorScheduleParams {
  doctorId: string;
  date: string; // Format: yyyy-MM-dd
}

/**
 * Lấy danh sách ID bác sĩ có lịch làm việc trong ngày được chỉ định
 * @param params - Tham số bao gồm ngày cần lấy danh sách bác sĩ
 * @returns Promise<GetDoctorOfDateResponse>
 */
export const getDoctorOfDate = async (params: GetDoctorOfDateParams): Promise<GetDoctorOfDateResponse> => {
  const { date } = params;
  
  const response = await api.get<GetDoctorOfDateResponse>(
    `/api/v1/doctor-schedules/getDoctorOfDate`,
    {
      params: { date }
    }
  );
  
  return response.data;
};

/**
 * Lấy lịch làm việc của bác sĩ theo ID và ngày
 * @param params - Tham số bao gồm doctorId và date
 * @returns Promise<GetDoctorScheduleResponse>
 */
export const getDoctorScheduleByDoctorIdAndDate = async (params: GetDoctorScheduleParams): Promise<GetDoctorScheduleResponse> => {
  const { doctorId, date } = params;
  
  const response = await api.get<GetDoctorScheduleResponse>(
    `/api/v1/doctor-schedules/getDoctorScheduleByDoctorIdAndDate`,
    {
      params: { doctorId, date }
    }
  );
  
  return response.data;
};

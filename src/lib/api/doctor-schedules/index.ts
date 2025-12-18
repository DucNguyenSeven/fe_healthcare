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
 * Interface cho thông tin bác sĩ kèm chi tiết lịch làm việc
 */
export interface DoctorScheduleInfo {
  doctorId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialty: string;
  experienceYears: number;
  avatarUrl: string | null;
  clinicAddress: string;
  scheduleId: string; // Quan trọng: Dùng cho bước đặt lịch
  rating: number | null;
  examinationFee: number | null;
}

/**
 * Response cho API getDoctorsWithDetailsByDate
 */
export interface GetDoctorsWithDetailsByDateResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: DoctorScheduleInfo[];
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
 * Lấy danh sách bác sĩ có lịch làm việc kèm thông tin chi tiết theo ngày
 * API mới - Tối ưu hơn so với getDoctorOfDate + getDoctorsInfo
 * @param params - Tham số bao gồm ngày cần lấy danh sách bác sĩ
 * @returns Promise<GetDoctorsWithDetailsByDateResponse>
 */
export const getDoctorsWithDetailsByDate = async (
  params: GetDoctorOfDateParams
): Promise<GetDoctorsWithDetailsByDateResponse> => {
  const { date } = params;

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD');
  }

  // Validate không cho chọn ngày quá khứ (trước hôm qua)
  const selectedDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (selectedDate < yesterday) {
    throw new Error('Không thể chọn ngày trong quá khứ');
  }

  const response = await api.get<GetDoctorsWithDetailsByDateResponse>(
    `/api/v1/doctor-schedules/getDoctorsWithDetailsByDate`,
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

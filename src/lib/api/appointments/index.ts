import api from '../client';

export interface AppointmentWeekFilterResponse {
  date: string;
  dayOfWeek: string;
  appointmentId: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED' | 'COMPLETED' | 'REJECTED' | 'NO_SHOW' | 'RESCHEDULED' | string;
  patientName: string;
  patientId: string;
  timeSlot?: {
    slotId: number;
    startTime: string;
    endTime: string;
  } | null;
  note?: string | null;
}

export interface DoctorAppointmentsWeekApiResponse {
  message: string;
  data: AppointmentWeekFilterResponse[];
  success: boolean;
}

export interface BookingAppointmentRequest {
  patientId: string;
  scheduleId: string;
  doctorId: string;
  symptoms?: string;
  note?: string;
  slotId: number;
  consultationType: 'ONLINE_CONSULTATION' | 'DIRECT_CONSULTATION' | 'FOLLOW_UP';
  addressDetail?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REJECTED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED';
  hasPredict?: boolean; // Indicates if patient has AI prediction
  // Thêm các field có thể thiếu
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
}

export interface TimeSlotInfo {
  slotId: number;
  startTime: string;
  endTime: string;
}

export interface BookingAppointmentResponse {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: TimeSlotInfo;
  status: string;
  consultationType: string;
}

export interface BookingAppointmentApiResponse {
  message: string;
  data: BookingAppointmentResponse;
  status?: string; // Optional vì API có thể trả về 'success' thay vì 'status'
  success?: boolean; // Field thực tế từ API
  statusCode?: number; // HTTP status code
}

/**
 * API để đặt lịch khám
 * @param data - Thông tin đặt lịch
 * @returns Promise<BookingAppointmentApiResponse>
 */
export const bookingAppointment = async (data: BookingAppointmentRequest): Promise<BookingAppointmentApiResponse> => {
  try {
    const response = await api.post<BookingAppointmentApiResponse>(
      '/api/v1/appointments/booking-appointment',
      data
    );
    
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Lấy danh sách lịch hẹn (đã xác nhận) theo tuần của bác sĩ
 */
export const getDoctorAppointmentsInWeek = async (params: {
  doctorId: string;
  startTime: string; // YYYY-MM-DD
  endTime: string;   // YYYY-MM-DD
}): Promise<DoctorAppointmentsWeekApiResponse> => {
  const query = new URLSearchParams({
    doctorId: params.doctorId,
    startTime: params.startTime,
    endTime: params.endTime,
  });

  const res = await api.get<DoctorAppointmentsWeekApiResponse>(
    `/api/v1/appointments/get-appointment-with-doctorId?${query.toString()}`
  );
  return res.data;
};

/**
 * Cập nhật trạng thái lịch hẹn
 */
export interface UpdateAppointmentStatusResponse {
  appointmentId: string;
  status: string;
  message: string;
  success: boolean;
}

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string
): Promise<UpdateAppointmentStatusResponse> => {
  try {
    const response = await api.put<UpdateAppointmentStatusResponse>(
      `/api/v1/appointments/${appointmentId}/update-status?status=${status}`
    );

    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn',
    };
  }
};

/**
 * Interface cho appointment detail response
 */
export interface AppointmentDetailResponse {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  status: string;
  patientName?: string;
  timeSlot?: {
    slotId: number;
    startTime: string;
    endTime: string;
  };
  note?: string;
}

/**
 * Lấy thông tin chi tiết appointment bao gồm patientId
 */
export const getAppointmentDetail = async (appointmentId: string): Promise<AppointmentDetailResponse> => {
  try {
    // Thử endpoint /api/v1/appointments/{id} trước
    const response = await api.get<{
      success: boolean;
      data: AppointmentDetailResponse;
      message?: string;
    }>(`/api/v1/appointments/${appointmentId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Không thể lấy thông tin appointment');
    }
  } catch (error: any) {
    // Nếu endpoint trên không work, sử dụng thông tin có sẵn
    console.warn('Không thể lấy appointment detail, sử dụng fallback');
    throw new Error('Không thể lấy thông tin chi tiết appointment');
  }
};

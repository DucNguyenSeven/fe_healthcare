import api from '../client';

export interface AppointmentWeekFilterResponse {
  date: string;
  dayOfWeek: string;
  appointmentId: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED' | 'COMPLETED' | 'REJECTED' | 'NO_SHOW' | 'RESCHEDULED' | string;
  patientName: string;
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

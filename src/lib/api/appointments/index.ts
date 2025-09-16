import api from '../client';

export interface BookingAppointmentRequest {
  patientId: string;
  scheduleId: string;
  doctorId: string;
  symptoms?: string;
  note?: string;
  slotId: number;
  consultationType: 'ONLINE_CONSULTATION' | 'DIRECT_CONSULTATION' | 'FOLLOW_UP';
  addressDetail?: string;
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

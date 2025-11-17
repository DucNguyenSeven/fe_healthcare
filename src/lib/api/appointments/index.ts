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
  symptoms?: string | null; // Patient symptoms
  hasPredict?: boolean; // Indicates if appointment has AI prediction
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
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REJECTED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED' | 'PAYMENT_PENDING';
  hasPredict?: boolean; // Indicates if patient has AI prediction
  payment_method?: 'CASH' | 'ONLINE'; // Payment method: CASH (WebSocket) or ONLINE (REST API + PaymentService)
  // Backend tự động set paymentStatus = UNPAID, frontend KHÔNG gửi payment_status
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
    // 🔍 DEBUG: Log request data BEFORE sending to backend
    console.log('🔍🔍🔍 [API - bookingAppointment] Sending request to backend:', {
      endpoint: '/api/v1/appointments/booking-appointment',
      method: 'POST',
      hasPredict: data.hasPredict,
      hasPredictType: typeof data.hasPredict,
      fullRequestData: data
    });

    // 🔍 DEBUG: Log payment_method specifically
    console.log('🔍🔍🔍 [API - Before POST] Request data:', data);
    console.log('🔍🔍🔍 [API - Before POST] payment_method value:', data.payment_method);
    console.log('🔍🔍🔍 [API - Before POST] payment_method type:', typeof data.payment_method);
    console.log('🔍🔍🔍 [API - Before POST] JSON stringified:', JSON.stringify(data, null, 2));

    const response = await api.post<BookingAppointmentApiResponse>(
      '/api/v1/appointments/booking-appointment',
      data
    );

    // 🔍 DEBUG: Log response from backend
    console.log('🔍🔍🔍 [API - bookingAppointment] Received response from backend:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error: any) {
    // Enhanced error handling: extract meaningful info from axios error
    console.error('🔍 [API] Booking appointment error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data
    });

    // Re-throw with original error structure to preserve all information
    // Caller will handle specific status codes (409, 400, 404, etc.)
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

// ==================== NEW APIs for Follow-up Management ====================

/**
 * Request body for scheduling follow-up appointment by doctor
 */
export interface ScheduleFollowUpByDoctorRequest {
  medicalRecordId: string;  // Medical Record just created (REQUIRED)
  patientId: string;         // Patient ID (REQUIRED)
  doctorId: string;          // Doctor ID (REQUIRED)
  scheduleId: string;        // Doctor's schedule ID (REQUIRED)
  slotId: number;            // Time slot ID (REQUIRED)
  appointmentDate: string;   // Appointment date YYYY-MM-DD (REQUIRED)
  note?: string;             // Optional note (default: "Tái khám theo chỉ định của bác sĩ")
}

/**
 * Response from scheduling follow-up appointment
 */
export interface ScheduleFollowUpByDoctorResponse {
  appointmentId: string;
  consultationType: 'FOLLOW_UP';
  status: 'CONFIRMED';
  relatedRecordId: string;
  patient: any;
  doctor: any;
  timeSlot: {
    slotId: number;
    startTime: string;
    endTime: string;
  };
  appointmentDate: string;
  note: string;
}

export interface ScheduleFollowUpApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: ScheduleFollowUpByDoctorResponse;
}

/**
 * Bác sĩ đặt lịch tái khám cho bệnh nhân
 * @param data - Thông tin đặt lịch tái khám
 * @returns Promise<ScheduleFollowUpApiResponse>
 */
export const scheduleFollowUpByDoctor = async (
  data: ScheduleFollowUpByDoctorRequest
): Promise<ScheduleFollowUpApiResponse> => {
  try {
    console.log('🔍 [API - scheduleFollowUpByDoctor] Sending request:', {
      endpoint: '/api/v1/appointments/schedule-follow-up-by-doctor',
      method: 'POST',
      data
    });

    const response = await api.post<ScheduleFollowUpApiResponse>(
      '/api/v1/appointments/schedule-follow-up-by-doctor',
      data
    );

    console.log('🔍 [API - scheduleFollowUpByDoctor] Received response:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('🔍 [API] Schedule follow-up error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data
    });

    throw error;
  }
};

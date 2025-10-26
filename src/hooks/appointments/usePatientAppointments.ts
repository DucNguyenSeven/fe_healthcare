import { useState, useCallback } from 'react';
import api from '@/lib/api/client';
import { getDoctorInfo, getDoctorsInfo } from '@/lib/api/doctors';

export interface AppointmentResponse {
  appointmentId: string;
  doctorId?: string; // Thêm field này vì có thể API chỉ trả về doctorId
  doctor?: {
    id: string;
    fullName: string; // API trả về fullName thay vì name
    specialty: string;
    examinationFee?: number;
    clinicAddress?: string;
    avatar?: string;
    rating?: number;
    experience?: string;
  } | null;
  patient: {
    id: string;
    name?: string;
    fullName?: string; // API trả về fullName cho patient
    phone?: string;
    email?: string;
  };
  symptoms?: string;
  note?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REJECTED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED';
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  appointmentDate: string;
  consultationType: 'ONLINE_CONSULTATION' | 'DIRECT_CONSULTATION' | 'FOLLOW_UP';
  addressDetail?: string;
  createdAt?: string;
  updatedAt?: string;
  hasPredict?: boolean; // Indicates if appointment has AI prediction
}

export interface PagedAppointmentResponse {
  content: AppointmentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AppointmentApiResponse {
  data: PagedAppointmentResponse;
  message: string;
  success: boolean;
}

export interface GetPatientAppointmentsParams {
  patientId: string;
  page?: number;
  size?: number;
  startTime: string; // YYYY-MM-DD format
  endTime: string; // YYYY-MM-DD format
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

/**
 * Function để enrich appointments với thông tin bác sĩ đầy đủ
 * OPTIMIZED: Use batch API instead of individual calls
 */
const enrichAppointmentsWithDoctorInfo = async (appointments: AppointmentResponse[]): Promise<AppointmentResponse[]> => {
  try {
    // Lấy danh sách unique doctor IDs (từ doctorId hoặc doctor.id)
    const doctorIds = Array.from(new Set(appointments
      .map(apt => apt.doctorId || apt.doctor?.id)
      .filter(Boolean)
    )) as string[];


    if (doctorIds.length === 0) {
      return appointments;
    }

    // OPTIMIZED: Use batch API instead of individual calls (N calls → 1 call)
    console.log(`🔍 [usePatientAppointments] Fetching info for ${doctorIds.length} doctors using batch API`);

    const doctorInfoMap = new Map<string, any>();

    try {
      const doctorInfoResponse = await getDoctorsInfo(doctorIds);

      if (doctorInfoResponse.success && doctorInfoResponse.data) {
        console.log(`✅ [usePatientAppointments] Successfully fetched ${doctorInfoResponse.data.length} doctor info`);

        doctorInfoResponse.data.forEach(doctorInfo => {
          const doctorId = doctorInfo.userId || doctorInfo.id;
          if (doctorId) {
            doctorInfoMap.set(doctorId, doctorInfo);
          }
        });
      }
    } catch (error) {
      console.error('❌ [usePatientAppointments] Error fetching batch doctor info:', error);
      // Fallback to individual calls if batch fails
      console.warn('⚠️ [usePatientAppointments] Falling back to individual getDoctorInfo calls');

      const doctorInfoPromises = doctorIds.map(async (doctorId) => {
        try {
          const doctorResponse = await getDoctorInfo(doctorId);
          return doctorResponse.success ? { id: doctorId, info: doctorResponse.data } : null;
        } catch (error) {
          console.error(`Error fetching doctor info for ID ${doctorId}:`, error);
          return null;
        }
      });

      const doctorResults = await Promise.all(doctorInfoPromises);

      doctorResults.forEach(result => {
        if (result) {
          doctorInfoMap.set(result.id, result.info);
        }
      });
    }


    // Enrich appointments với thông tin bác sĩ đầy đủ
    return appointments.map(appointment => {
      const doctorId = appointment.doctorId || appointment.doctor?.id;
      if (doctorId) {
        const doctorInfo = doctorInfoMap.get(doctorId);
        if (doctorInfo) {
          return {
            ...appointment,
            doctor: {
              id: doctorId,
              fullName: doctorInfo.fullName || doctorInfo.name || appointment.doctor?.fullName || 'Chưa có thông tin bác sĩ',
              specialty: doctorInfo.specialty || appointment.doctor?.specialty || 'Chưa rõ chuyên khoa',
              examinationFee: doctorInfo.examinationFee,
              clinicAddress: doctorInfo.clinicAddress,
              avatar: doctorInfo.avatarUrl || doctorInfo.avatar,
              rating: doctorInfo.rating,
              experience: doctorInfo.experienceYears ? `${doctorInfo.experienceYears} năm kinh nghiệm` : doctorInfo.experience
            }
          };
        }
      }

      // Fallback: nếu không có thông tin chi tiết, sử dụng dữ liệu có sẵn
      if (appointment.doctor?.fullName) {
        return {
          ...appointment,
          doctor: {
            ...appointment.doctor,
            fullName: appointment.doctor.fullName
          }
        };
      }

      return appointment;
    });
  } catch (error) {
    console.error('Error enriching appointments with doctor info:', error);
    return appointments;
  }
};

/**
 * Hook để lấy danh sách cuộc hẹn của patient
 */
export const usePatientAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAppointments = useCallback(async (params: GetPatientAppointmentsParams) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        patientId: params.patientId,
        page: (params.page || 0).toString(),
        size: (params.size || 10).toString(),
        startTime: params.startTime,
        endTime: params.endTime,
        sortBy: params.sortBy || 'createdAt',
        sortDir: params.sortDir || 'DESC'
      });

      const response = await api.get<AppointmentApiResponse>(
        `/api/v1/appointments/get-appointment-with-patientId?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {

        // Sử dụng trực tiếp dữ liệu từ API vì đã có đủ thông tin
        // Không cần enrichment để tránh overwrite dữ liệu có sẵn
        setAppointments(response.data.data.content);
        setTotalElements(response.data.data.totalElements);
        setTotalPages(response.data.data.totalPages);
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách cuộc hẹn');
      }
    } catch (error: any) {
      console.error('Error fetching patient appointments:', error);

      let errorMessage = 'Không thể tải danh sách cuộc hẹn';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setAppointments([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setAppointments([]);
    setLoading(false);
    setError(null);
    setTotalElements(0);
    setTotalPages(0);
  }, []);

  return {
    appointments,
    loading,
    error,
    totalElements,
    totalPages,
    fetchAppointments,
    clearError,
    reset
  };
};

/**
 * Helper function để chuyển đổi appointment response thành format của component
 */
export const transformAppointmentToTimelineFormat = (appointment: AppointmentResponse) => {
  // Map status từ backend sang frontend
  const statusMapping: { [key: string]: 'upcoming' | 'completed' | 'cancelled' } = {
    'PENDING': 'upcoming',
    'CONFIRMED': 'upcoming',
    'COMPLETED': 'completed',
    'CANCELED': 'cancelled',
    'REJECTED': 'cancelled',
    'NO_SHOW': 'cancelled',
    'RESCHEDULED': 'upcoming'
  };

  // Map consultation type thành appointment type, kiểm tra note để phân biệt lab_test
  const getAppointmentType = (consultationType: string, note?: string): 'direct' | 'online' | 'lab_test' | 'follow_up' => {
    switch (consultationType) {
      case 'ONLINE_CONSULTATION':
        return 'online';
      case 'FOLLOW_UP':
        return 'follow_up';
      case 'DIRECT_CONSULTATION':
        // Kiểm tra note để phân biệt lab_test và direct
        if (note && note.toLowerCase().includes('xét nghiệm')) {
          return 'lab_test';
        }
        return 'direct';
      default:
        return 'direct';
    }
  };

  // Determine service name based on consultation type và note để match với form booking
  const getServiceName = (consultationType: string, note?: string) => {
    switch (consultationType) {
      case 'ONLINE_CONSULTATION':
        return 'Tư vấn online';
      case 'FOLLOW_UP':
        return 'Tái khám';
      case 'DIRECT_CONSULTATION':
        // Kiểm tra note để phân biệt Xét nghiệm và Khám trực tiếp
        if (note && note.toLowerCase().includes('xét nghiệm')) {
          return 'Xét nghiệm';
        }
        return 'Khám trực tiếp';
      default:
        return 'Khám trực tiếp';
    }
  };

  // Get doctor name with priority: fullName > fallback
  const getDoctorName = () => {
    if (appointment.doctor?.fullName) {
      return appointment.doctor.fullName;
    }
    return 'Chưa có thông tin bác sĩ';
  };

  const result = {
    id: appointment.appointmentId,
    service: getServiceName(appointment.consultationType, appointment.note),
    doctor: getDoctorName(), // String for display
    doctorInfo: appointment.doctor, // Preserve full object for chat functionality
    date: appointment.appointmentDate,
    time: appointment.timeSlot.startTime,
    status: (statusMapping[appointment.status] || 'upcoming') as 'upcoming' | 'completed' | 'cancelled',
    backendStatus: appointment.status, // Keep original backend status for PENDING/CONFIRMED/REJECTED distinction
    type: getAppointmentType(appointment.consultationType, appointment.note),
    canJoin: appointment.status === 'CONFIRMED' && appointment.consultationType === 'ONLINE_CONSULTATION',
    // Thêm thông tin bổ sung để hiển thị trong phần chi tiết
    patientInfo: appointment.patient,
    symptoms: appointment.symptoms,
    note: appointment.note,
    // WORKAROUND: Backend đang trả về sai addressDetail, tạm thời fix ở frontend
    addressDetail: (() => {
      // Nếu là ONLINE_CONSULTATION thì luôn hiển thị "Tại nhà"
      if (appointment.consultationType === 'ONLINE_CONSULTATION') {
        return 'Tại nhà';
      }
      // Nếu backend trả về "TP HCM" cho DIRECT_CONSULTATION, tạm thời để nguyên
      // TODO: Backend cần fix để trả về đúng địa chỉ từ database
      return appointment.addressDetail || (appointment as any).address_detail || 'Chưa có thông tin địa chỉ';
    })()
  };

  return result;
};
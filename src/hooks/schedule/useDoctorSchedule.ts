import { useState } from 'react';
import { DoctorScheduleApi } from '@/lib/api/schedule';
import type {
  CreateDoctorScheduleRequest,
  BulkCreateDoctorScheduleRequest,
  DoctorScheduleResponse,
  GetDoctorScheduleRequest,
  GetDoctorsOfDateRequest,
  TimeSlotId,
  WeekDay
} from '@/lib/api/types';

interface UseDoctorScheduleReturn {
  createSchedule: (data: CreateDoctorScheduleRequest) => Promise<DoctorScheduleResponse | null>;
  bulkCreateSchedule: (data: BulkCreateDoctorScheduleRequest) => Promise<DoctorScheduleResponse[] | null>;
  getDoctorScheduleByDate: (params: GetDoctorScheduleRequest) => Promise<DoctorScheduleResponse | null>;
  getDoctorsOfDate: (params: GetDoctorsOfDateRequest) => Promise<DoctorScheduleResponse[] | null>;
  isLoading: boolean;
  error: string | null;
}

// Helper function để convert time string sang TimeSlotId
export const timeStringToSlotId = (timeString: string): TimeSlotId | null => {
  const timeMap: Record<string, TimeSlotId> = {
    '08:00': 1,
    '08:30': 2,
    '09:00': 3,
    '09:30': 4,
    '10:00': 5,
    '10:30': 6,
    '11:00': 7,
    '11:30': 8,
    '14:00': 9,
    '14:30': 10,
    '15:00': 11,
    '15:30': 12,
    '16:00': 13,
    '16:30': 14,
    '17:00': 15,
    '17:30': 16  // Thêm slot 16 cho 17:30
  };

  return timeMap[timeString] || null;
};

// Helper function để convert ngày thành WeekDay (as number)
export const dateToWeekDay = (dateString: string): WeekDay => {
  const date = new Date(dateString);
  const jsDay = date.getDay(); // 0-6 (Sunday-Saturday)

  // JavaScript: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // Backend expects: 0=MONDAY, 1=TUESDAY, 2=WEDNESDAY, 3=THURSDAY, 4=FRIDAY, 5=SATURDAY, 6=SUNDAY
  let weekDay: WeekDay;
  switch (jsDay) {
    case 0: weekDay = 6; break; // Sunday → 6
    case 1: weekDay = 0; break; // Monday → 0
    case 2: weekDay = 1; break; // Tuesday → 1
    case 3: weekDay = 2; break; // Wednesday → 2
    case 4: weekDay = 3; break; // Thursday → 3
    case 5: weekDay = 4; break; // Friday → 4
    case 6: weekDay = 5; break; // Saturday → 5
    default: weekDay = 0; break; // Default to Monday
  }

  return weekDay;
};

// Helper function để convert time strings array sang TimeSlotId array
export const timeStringsToSlotIds = (timeStrings: string[]): TimeSlotId[] => {
  const results = timeStrings.map(timeString => timeStringToSlotId(timeString));
  const validSlots = results.filter((id): id is TimeSlotId => id !== null);
  return validSlots;
};

// Helper function để convert ngày thành weekDay string cho backend
export const dateToBackendWeekDay = (dateString: string): string => {
  const date = new Date(dateString);
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  const weekDayMap = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY'
  };

  return weekDayMap[jsDay as keyof typeof weekDayMap];
};

// Helper function để tạo BulkCreateDoctorScheduleRequest từ danh sách ngày (theo backend format)
export const createBulkScheduleRequest = (
  doctorId: string,
  dates: string[]
): BulkCreateDoctorScheduleRequest => {
  const dateSchedules = dates.map(dateString => ({
    weekDay: dateToBackendWeekDay(dateString),
    workDate: dateString
  }));

  return {
    doctorId,
    dateSchedules
  };
};

export const useDoctorSchedule = (): UseDoctorScheduleReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async <T>(
    apiCall: () => Promise<any>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      let errorMessage = 'Có lỗi xảy ra khi thực hiện thao tác';

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string; statusCode?: number }; status?: number; statusText?: string } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createSchedule = async (data: CreateDoctorScheduleRequest): Promise<DoctorScheduleResponse | null> => {
    return handleApiCall(() => DoctorScheduleApi.create(data));
  };

  const bulkCreateSchedule = async (data: BulkCreateDoctorScheduleRequest): Promise<DoctorScheduleResponse[] | null> => {
    return handleApiCall(() => DoctorScheduleApi.bulkCreate(data));
  };

  const getDoctorScheduleByDate = async (params: GetDoctorScheduleRequest): Promise<DoctorScheduleResponse | null> => {
    return handleApiCall(() => DoctorScheduleApi.getDoctorScheduleByDate(params));
  };

  const getDoctorsOfDate = async (params: GetDoctorsOfDateRequest): Promise<DoctorScheduleResponse[] | null> => {
    return handleApiCall(() => DoctorScheduleApi.getDoctorsOfDate(params));
  };

  return {
    createSchedule,
    bulkCreateSchedule,
    getDoctorScheduleByDate,
    getDoctorsOfDate,
    isLoading,
    error,
  };
};
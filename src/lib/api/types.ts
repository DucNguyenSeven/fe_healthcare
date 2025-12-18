export type MessageResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
};

export type AuthenticationResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  userId: string;
  role: string;
};

export type ResetPasswordResponse = {
  statusCode: number;
  message: string;
  email: string;
};

export type UploadFile = {
  imageUrls: string[];
  publicIds: string[];
};

export type UserResponse = Record<string, unknown>;

export type RegisterRequest = { email: string; password: string };
export type AuthenticationRequest = { email: string; password: string };
export type ResetPasswordRequest = { email: string; newPassword: string };
export type UpdateUserRequest = {
  userId: string;
  fullName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';  // Strict typing để match backend enum
  dob?: string;
  phone?: string;
  address?: string;
  role?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  bmi?: number;
};

export type UpdateDoctorRequest = {
  userId: string;
  specialty?: string;
  experienceYears?: number;
  examinationFee?: number;
  clinicAddress?: string;
  bio?: string;
};

export type ChatRequest = { question: string };
export type ChatResponse = { answer: string };

// Doctor Schedule API Types
export type TimeSlotId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

// WeekDay as number (backend ordinal mapping)
// 0=MONDAY, 1=TUESDAY, 2=WEDNESDAY, 3=THURSDAY, 4=FRIDAY, 5=SATURDAY, 6=SUNDAY
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type CreateDoctorScheduleRequest = {
  doctorId: string;
  weekDay: WeekDay;
  workDate: string; // YYYY-MM-DD format
  available: boolean; // Changed from isAvailable to match backend
  timeSlotIds: TimeSlotId[];
};

export type BulkCreateDoctorScheduleRequest = {
  doctorId: string;
  dateSchedules: {
    weekDay: string; // "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    workDate: string; // YYYY-MM-DD format
  }[];
};

export type TimeSlot = {
  slotId: number;
  startTime: string;
  endTime: string;
};

export type DoctorScheduleResponse = {
  id?: string; // Optional vì API có thể trả về scheduleId thay vì id
  scheduleId?: string; // Field thực tế từ API
  doctorId: string;
  weekDay: WeekDay;
  workDate: string;
  available: boolean; // Changed from isAvailable to match backend
  timeSlotIds: TimeSlotId[];
  timeSlots?: TimeSlot[]; // Added for API response compatibility
  createdAt: string;
  updatedAt: string;
};

export type GetDoctorScheduleRequest = {
  doctorId: string;
  date: string; // YYYY-MM-DD format
};

export type GetDoctorsOfDateRequest = {
  date: string; // YYYY-MM-DD format
};

// Appointment Booking API Types
export type ConsultationType = 'ONLINE_CONSULTATION' | 'DIRECT_CONSULTATION' | 'FOLLOW_UP';

export type BookingAppointmentRequest = {
  patientId: string;
  scheduleId: string;
  doctorId: string;
  symptoms?: string;
  note?: string;
  slotId: number;
  consultationType: ConsultationType;
  addressDetail?: string;
};

export type TimeSlotInfo = {
  slotId: number;
  startTime: string;
  endTime: string;
};

export type BookingAppointmentResponse = {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: TimeSlotInfo;
  status: string;
  consultationType: string;
};

export type BookingAppointmentApiResponse = {
  message: string;
  data: BookingAppointmentResponse;
  status: string;
};

// ============================================
// ADMIN DASHBOARD TYPES
// Based on: docs/ADMIN_API_DOCUMENTATION.md
// ============================================

// ============================================
// ENUMS
// ============================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum ConsultationType {
  VIDEO_CALL = 'VIDEO_CALL',
  IN_PERSON = 'IN_PERSON',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStatistics {
  totalRevenueThisMonth: number;
  totalAppointmentsThisMonth: number;
  totalActiveUsers: number;
  growthRate: number;
}

export interface RevenueTrendItem {
  date: string; // Format: "2025-12-01"
  revenue: number;
}

export interface AppointmentsByStatus {
  COMPLETED: number;
  CONFIRMED: number;
  CANCELLED: number;
}

export interface TopDoctor {
  doctorId: string;
  doctorName: string;
  specialty: string;
  totalRevenue: number;
  appointmentCount: number;
  rating: number;
}

export interface RevenueByServiceType {
  VIDEO_CALL: number;
  IN_PERSON: number;
}

export interface DashboardCharts {
  revenueTrend: RevenueTrendItem[];
  appointmentsByStatus: AppointmentsByStatus;
  topDoctors: TopDoctor[];
  revenueByServiceType: RevenueByServiceType;
}

export interface RecentActivities {
  recentUsers: any[]; // TODO: Define proper types when backend provides data
  recentAppointments: any[];
  recentPayments: any[];
}

export interface DashboardResponse {
  statistics: DashboardStatistics;
  charts: DashboardCharts;
  recentActivities: RecentActivities;
}

// ============================================
// REVENUE TYPES
// ============================================

export interface RevenueOverview {
  totalRevenue: number;
  totalAppointments: number;
  averagePaymentAmount: number;
  completedAppointments: number;
}

export interface RevenueByTimeItem {
  date: string;
  revenue: number;
  count: number;
}

export interface RevenueByDoctor {
  doctorId: string;
  doctorName: string;
  specialty: string;
  totalRevenue: number;
  appointmentCount: number;
  rating: number;
}

export interface RevenueBySpecialty {
  specialty: string;
  totalRevenue: number;
  doctorCount: number;
  appointmentCount: number;
}

export interface RevenueByServiceTypeItem {
  serviceType: ConsultationType;
  totalRevenue: number;
  appointmentCount: number;
}

// Paginated response for revenue by doctor
export interface PaginatedRevenueByDoctor {
  content: RevenueByDoctor[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// ============================================
// USER MANAGEMENT TYPES
// ============================================

export interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO DateTime
  lastLoginAt: string; // ISO DateTime
}

export interface UserDetails extends User {
  dateOfBirth: string; // ISO Date
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  updatedAt: string; // ISO DateTime
}

export interface UpdateUserStatusRequest {
  newStatus: UserStatus;
  reason: string;
}

export interface UpdateUserStatusResponse {
  userId: string;
  username: string;
  status: UserStatus;
  updatedAt: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    DOCTOR: number;
    PATIENT: number;
    ADMIN: number;
  };
  growthRate: number;
}

// Paginated response for users
export interface PaginatedUsers {
  content: User[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export interface AppointmentStatistics {
  totalAppointments: number;
  appointmentsByStatus: {
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
    NO_SHOW: number;
  };
  appointmentsByType: {
    VIDEO_CALL: number;
    IN_PERSON: number;
  };
}

export interface Appointment {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO Date
  timeSlot: string; // "09:00-09:30"
  consultationType: ConsultationType;
  status: AppointmentStatus;
  createdAt: string; // ISO DateTime
}

export interface AppointmentsByConsultationType {
  VIDEO_CALL: number;
  IN_PERSON: number;
}

export interface CompletedAppointmentsByDoctor {
  [doctorId: string]: number;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface RevenueStatistics {
  totalRevenue: number;
  paymentCount: number;
  averagePaymentAmount: number;
}

export interface PaymentByDate {
  date: string; // "2025-12-01"
  revenue: number;
  count: number;
}

export interface Payment {
  paymentId: string;
  appointmentId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string; // "VNPAY", "MOMO", etc.
  transactionId: string;
  paidAt: string; // ISO DateTime
  createdAt: string; // ISO DateTime
}

// ============================================
// DOCTOR TYPES
// ============================================

export interface Doctor {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  specialty: string;
  experienceYears: number;
  licenseNumber: string;
  hospitalAffiliation: string;
  bio: string;
  rating: number;
  totalReviews: number;
  status: UserStatus;
}

// ============================================
// API QUERY PARAMS
// ============================================

export interface DateRangeParams {
  startDate: string; // ISO DateTime or ISO Date (depends on API)
  endDate: string;   // ISO DateTime or ISO Date (depends on API)
}

export interface PaginationParams {
  page?: number;     // Default: 0
  size?: number;     // Default: 20
  sort?: string;     // e.g., "createdAt,desc"
}

export interface UserFilterParams extends PaginationParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface RevenueByDoctorParams extends DateRangeParams, PaginationParams {}

export interface TopPerformersParams extends DateRangeParams {
  limit?: number; // Default: 10, Max: 50
}

// ============================================
// ERROR RESPONSE
// ============================================

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

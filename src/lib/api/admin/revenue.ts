/**
 * Admin Revenue Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 2
 */

import {
  ConsultationType,
  type RevenueOverview,
  type RevenueByTimeItem,
  type PaginatedRevenueByDoctor,
  type RevenueBySpecialty,
  type RevenueByServiceTypeItem,
  type RevenueByDoctor,
  type DateRangeParams,
  type RevenueByDoctorParams,
  type TopPerformersParams,
} from '@/types/admin';

// ============================================
// MOCK DATA
// ============================================

const mockRevenueOverview: RevenueOverview = {
  totalRevenue: 150000000,
  totalAppointments: 245,
  averagePaymentAmount: 612244.89,
  completedAppointments: 180,
};

const mockRevenueByTime: RevenueByTimeItem[] = [
  { date: '2025-12-01', revenue: 5000000, count: 8 },
  { date: '2025-12-02', revenue: 5500000, count: 9 },
  { date: '2025-12-03', revenue: 4800000, count: 7 },
  { date: '2025-12-04', revenue: 6200000, count: 10 },
  { date: '2025-12-05', revenue: 5900000, count: 9 },
  { date: '2025-12-06', revenue: 6500000, count: 11 },
  { date: '2025-12-07', revenue: 7200000, count: 12 },
  { date: '2025-12-08', revenue: 6800000, count: 11 },
];

const mockRevenueByDoctors: RevenueByDoctor[] = [
  {
    doctorId: 'DOC001',
    doctorName: 'Dr. Nguyễn Văn A',
    specialty: 'Nội khoa',
    totalRevenue: 25000000,
    appointmentCount: 45,
    rating: 4.8,
  },
  {
    doctorId: 'DOC002',
    doctorName: 'Dr. Trần Thị B',
    specialty: 'Tim mạch',
    totalRevenue: 22000000,
    appointmentCount: 38,
    rating: 4.9,
  },
  {
    doctorId: 'DOC003',
    doctorName: 'Dr. Lê Văn C',
    specialty: 'Ngoại khoa',
    totalRevenue: 20000000,
    appointmentCount: 35,
    rating: 4.7,
  },
  {
    doctorId: 'DOC004',
    doctorName: 'Dr. Phạm Thị D',
    specialty: 'Sản phụ khoa',
    totalRevenue: 18000000,
    appointmentCount: 32,
    rating: 4.6,
  },
  {
    doctorId: 'DOC005',
    doctorName: 'Dr. Hoàng Văn E',
    specialty: 'Nhi khoa',
    totalRevenue: 17000000,
    appointmentCount: 30,
    rating: 4.8,
  },
];

const mockRevenueBySpecialty: RevenueBySpecialty[] = [
  {
    specialty: 'Nội khoa',
    totalRevenue: 45000000,
    doctorCount: 12,
    appointmentCount: 150,
  },
  {
    specialty: 'Ngoại khoa',
    totalRevenue: 38000000,
    doctorCount: 10,
    appointmentCount: 120,
  },
  {
    specialty: 'Tim mạch',
    totalRevenue: 35000000,
    doctorCount: 8,
    appointmentCount: 100,
  },
  {
    specialty: 'Sản phụ khoa',
    totalRevenue: 32000000,
    doctorCount: 9,
    appointmentCount: 95,
  },
];

const mockRevenueByServiceType: RevenueByServiceTypeItem[] = [
  {
    serviceType: ConsultationType.VIDEO_CALL,
    totalRevenue: 80000000,
    appointmentCount: 180,
  },
  {
    serviceType: ConsultationType.IN_PERSON,
    totalRevenue: 70000000,
    appointmentCount: 65,
  },
];

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Revenue Overview
 * Endpoint: GET /api/v1/admin/revenue/overview
 */
export async function getRevenueOverview(
  params: DateRangeParams
): Promise<RevenueOverview> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueOverview', params);
  return mockRevenueOverview;
}

/**
 * Get Revenue By Time (Daily Breakdown)
 * Endpoint: GET /api/v1/admin/revenue/by-time
 */
export async function getRevenueByTime(
  params: DateRangeParams
): Promise<RevenueByTimeItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueByTime', params);
  return mockRevenueByTime;
}

/**
 * Get Revenue By Doctor (Paginated)
 * Endpoint: GET /api/v1/admin/revenue/by-doctor
 */
export async function getRevenueByDoctor(
  params: RevenueByDoctorParams
): Promise<PaginatedRevenueByDoctor> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueByDoctor', params);

  const page = params.page || 0;
  const size = params.size || 20;
  const totalElements = mockRevenueByDoctors.length;
  const totalPages = Math.ceil(totalElements / size);

  return {
    content: mockRevenueByDoctors,
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      pageNumber: page,
      pageSize: size,
      offset: page * size,
      paged: true,
      unpaged: false,
    },
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
    first: page === 0,
    size,
    number: page,
    numberOfElements: mockRevenueByDoctors.length,
    empty: false,
  };
}

/**
 * Get Revenue By Specialty
 * Endpoint: GET /api/v1/admin/revenue/by-specialty
 */
export async function getRevenueBySpecialty(
  params: DateRangeParams
): Promise<RevenueBySpecialty[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueBySpecialty', params);
  return mockRevenueBySpecialty;
}

/**
 * Get Revenue By Service Type
 * Endpoint: GET /api/v1/admin/revenue/by-service-type
 */
export async function getRevenueByServiceType(
  params: DateRangeParams
): Promise<RevenueByServiceTypeItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getRevenueByServiceType', params);
  return mockRevenueByServiceType;
}

/**
 * Get Top Performers
 * Endpoint: GET /api/v1/admin/revenue/top-performers
 */
export async function getTopPerformers(
  params: TopPerformersParams
): Promise<RevenueByDoctor[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getTopPerformers', params);

  const limit = params.limit || 10;
  return mockRevenueByDoctors.slice(0, Math.min(limit, 50));
}

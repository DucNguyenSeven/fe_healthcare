/**
 * Admin User Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 3
 */

import {
  UserRole,
  UserStatus,
  type User,
  type UserDetails,
  type UserStatistics,
  type PaginatedUsers,
  type UserFilterParams,
  type UpdateUserStatusRequest,
  type UpdateUserStatusResponse,
} from '@/types/admin';

// ============================================
// MOCK DATA
// ============================================

const mockUsers: User[] = [
  {
    userId: 'USER001',
    username: 'nguyenvana',
    email: 'nguyenvana@gmail.com',
    fullName: 'Nguyễn Văn A',
    phoneNumber: '0912345678',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    createdAt: '2025-01-15T10:30:00',
    lastLoginAt: '2025-12-08T14:20:00',
  },
  {
    userId: 'USER002',
    username: 'tranthib',
    email: 'tranthib@gmail.com',
    fullName: 'Trần Thị B',
    phoneNumber: '0923456789',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    createdAt: '2025-02-10T09:15:00',
    lastLoginAt: '2025-12-08T16:45:00',
  },
  {
    userId: 'DOC001',
    username: 'dr.nguyenvana',
    email: 'dr.nguyenvana@hospital.vn',
    fullName: 'Dr. Nguyễn Văn A',
    phoneNumber: '0934567890',
    role: UserRole.DOCTOR,
    status: UserStatus.ACTIVE,
    createdAt: '2024-06-20T08:00:00',
    lastLoginAt: '2025-12-08T18:30:00',
  },
  {
    userId: 'ADMIN001',
    username: 'admin',
    email: 'admin@healthcare.vn',
    fullName: 'Administrator',
    phoneNumber: '0945678901',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00',
    lastLoginAt: '2025-12-09T10:00:00',
  },
  {
    userId: 'USER003',
    username: 'levand',
    email: 'levand@gmail.com',
    fullName: 'Lê Văn D',
    phoneNumber: '0956789012',
    role: UserRole.PATIENT,
    status: UserStatus.INACTIVE,
    createdAt: '2025-03-05T11:20:00',
    lastLoginAt: '2025-11-20T15:30:00',
  },
];

const mockUserDetails: UserDetails = {
  userId: 'USER001',
  username: 'nguyenvana',
  email: 'nguyenvana@gmail.com',
  fullName: 'Nguyễn Văn A',
  phoneNumber: '0912345678',
  dateOfBirth: '1990-05-15',
  gender: 'MALE',
  address: '123 Nguyễn Huệ, Q1, HCM',
  role: UserRole.PATIENT,
  status: UserStatus.ACTIVE,
  createdAt: '2025-01-15T10:30:00',
  updatedAt: '2025-12-08T14:20:00',
  lastLoginAt: '2025-12-08T14:20:00',
};

const mockUserStatistics: UserStatistics = {
  totalUsers: 1250,
  activeUsers: 1100,
  inactiveUsers: 100,
  blockedUsers: 50,
  newUsersThisMonth: 85,
  usersByRole: {
    DOCTOR: 150,
    PATIENT: 1080,
    ADMIN: 20,
  },
  growthRate: 7.2,
};

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Users List (With Filters)
 * Endpoint: GET /api/v1/admin/users
 */
export async function getUsers(
  params: UserFilterParams
): Promise<PaginatedUsers> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  console.log('API Call: getUsers', params);

  let filteredUsers = [...mockUsers];

  // Apply filters
  if (params.role) {
    filteredUsers = filteredUsers.filter((u) => u.role === params.role);
  }
  if (params.status) {
    filteredUsers = filteredUsers.filter((u) => u.status === params.status);
  }
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.phoneNumber.includes(searchLower)
    );
  }

  const page = params.page || 0;
  const size = params.size || 20;
  const totalElements = filteredUsers.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const end = Math.min(start + size, totalElements);
  const content = filteredUsers.slice(start, end);

  return {
    content,
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      pageNumber: page,
      pageSize: size,
      offset: start,
      paged: true,
      unpaged: false,
    },
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
    first: page === 0,
    size,
    number: page,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

/**
 * Get User Details
 * Endpoint: GET /api/v1/admin/users/{userId}
 */
export async function getUserDetails(userId: string): Promise<UserDetails> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getUserDetails', userId);
  return mockUserDetails;
}

/**
 * Update User Status
 * Endpoint: PUT /api/v1/admin/users/{userId}/status
 */
export async function updateUserStatus(
  userId: string,
  request: UpdateUserStatusRequest
): Promise<UpdateUserStatusResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('API Call: updateUserStatus', userId, request);

  return {
    userId,
    username: 'nguyenvana',
    status: request.newStatus,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get User Statistics
 * Endpoint: GET /api/v1/admin/users/statistics
 */
export async function getUserStatistics(): Promise<UserStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getUserStatistics');
  return mockUserStatistics;
}

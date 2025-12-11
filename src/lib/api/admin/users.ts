/**
 * Admin User Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 3
 */

import api from '../client';
import type {
  UserDetails,
  UserStatistics,
  PaginatedUsers,
  UserFilterParams,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
} from '@/types/admin';

/**
 * Get Users List (With Filters)
 * Endpoint: GET /api/v1/admin/users
 */
export async function getUsers(
  params: UserFilterParams
): Promise<PaginatedUsers> {
  const response = await api.get<PaginatedUsers>('/api/v1/admin/users', {
    params,
  });
  return response.data;
}

/**
 * Get User Details
 * Endpoint: GET /api/v1/admin/users/{userId}
 */
export async function getUserDetails(userId: string): Promise<UserDetails> {
  const response = await api.get<UserDetails>(`/api/v1/admin/users/${userId}`);
  return response.data;
}

/**
 * Update User Status
 * Endpoint: PUT /api/v1/admin/users/{userId}/status
 */
export async function updateUserStatus(
  userId: string,
  request: UpdateUserStatusRequest
): Promise<UpdateUserStatusResponse> {
  const response = await api.put<UpdateUserStatusResponse>(
    `/api/v1/admin/users/${userId}/status`,
    request
  );
  return response.data;
}

/**
 * Get User Statistics
 * Endpoint: GET /api/v1/admin/users/statistics
 */
export async function getUserStatistics(): Promise<UserStatistics> {
  const response = await api.get<UserStatistics>('/api/v1/admin/users/statistics');
  return response.data;
}

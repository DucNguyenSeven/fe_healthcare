/**
 * Admin Doctor Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 6
 */

import api from '../client';
import type { Doctor } from '@/types/admin';

/**
 * Get Doctors By IDs
 * Endpoint: POST /api/v1/doctors/admin/by-ids
 */
export async function getDoctorsByIds(doctorIds: string[]): Promise<Doctor[]> {
  const response = await api.post<Doctor[]>('/api/v1/doctors/admin/by-ids', {
    doctorIds,
  });
  return response.data;
}

/**
 * Register Doctor Account (Admin)
 * Endpoint: POST /api/v1/auth/register-doctor
 */
export async function registerDoctorAccount(payload: {
  email: string;
  password: string;
}): Promise<{ message: string; doctorId?: string }> {
  const response = await api.post('/api/v1/auth/register-doctor', payload);
  return response.data;
}

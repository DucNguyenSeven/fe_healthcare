/**
 * Admin Appointment Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 4
 */

import api from '../client';
import type {
  AppointmentStatistics,
  Appointment,
  AppointmentsByConsultationType,
  CompletedAppointmentsByDoctor,
} from '@/types/admin';

/**
 * Get Appointment Statistics
 * Endpoint: GET /api/v1/admin/appointments/statistics
 */
export async function getAppointmentStatistics(
  params: { startDate: string; endDate: string }
): Promise<AppointmentStatistics> {
  const response = await api.get<AppointmentStatistics>(
    '/api/v1/admin/appointments/statistics',
    { params }
  );
  return response.data;
}

/**
 * Get Appointments By IDs
 * Endpoint: POST /api/v1/admin/appointments/by-ids
 */
export async function getAppointmentsByIds(
  appointmentIds: string[]
): Promise<Appointment[]> {
  const response = await api.post<Appointment[]>(
    '/api/v1/admin/appointments/by-ids',
    { appointmentIds }
  );
  return response.data;
}

/**
 * Get Stats By Consultation Type
 * Endpoint: GET /api/v1/admin/appointments/stats-by-type
 */
export async function getStatsByConsultationType(
  params: { startDate: string; endDate: string }
): Promise<AppointmentsByConsultationType> {
  const response = await api.get<AppointmentsByConsultationType>(
    '/api/v1/admin/appointments/stats-by-type',
    { params }
  );
  return response.data;
}

/**
 * Get Completed Appointments By Doctor
 * Endpoint: GET /api/v1/admin/appointments/completed-by-doctor
 */
export async function getCompletedAppointmentsByDoctor(
  params: { startDate: string; endDate: string }
): Promise<CompletedAppointmentsByDoctor> {
  const response = await api.get<CompletedAppointmentsByDoctor>(
    '/api/v1/admin/appointments/completed-by-doctor',
    { params }
  );
  return response.data;
}

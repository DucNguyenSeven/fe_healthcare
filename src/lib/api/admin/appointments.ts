/**
 * Admin Appointment Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 4
 */

import {
  ConsultationType,
  AppointmentStatus,
  type AppointmentStatistics,
  type Appointment,
  type AppointmentsByConsultationType,
  type CompletedAppointmentsByDoctor,
  type DateRangeParams,
} from '@/types/admin';

// ============================================
// MOCK DATA
// ============================================

const mockAppointmentStatistics: AppointmentStatistics = {
  totalAppointments: 245,
  appointmentsByStatus: {
    PENDING: 25,
    CONFIRMED: 45,
    COMPLETED: 150,
    CANCELLED: 20,
    NO_SHOW: 5,
  },
  appointmentsByType: {
    VIDEO_CALL: 180,
    IN_PERSON: 65,
  },
};

const mockAppointments: Appointment[] = [
  {
    appointmentId: 'APT001',
    patientId: 'PAT001',
    doctorId: 'DOC001',
    appointmentDate: '2025-12-10',
    timeSlot: '09:00-09:30',
    consultationType: ConsultationType.VIDEO_CALL,
    status: AppointmentStatus.CONFIRMED,
    createdAt: '2025-12-08T10:00:00',
  },
  {
    appointmentId: 'APT002',
    patientId: 'PAT002',
    doctorId: 'DOC002',
    appointmentDate: '2025-12-10',
    timeSlot: '10:00-10:30',
    consultationType: ConsultationType.IN_PERSON,
    status: AppointmentStatus.COMPLETED,
    createdAt: '2025-12-07T14:30:00',
  },
  {
    appointmentId: 'APT003',
    patientId: 'PAT003',
    doctorId: 'DOC001',
    appointmentDate: '2025-12-11',
    timeSlot: '14:00-14:30',
    consultationType: ConsultationType.VIDEO_CALL,
    status: AppointmentStatus.PENDING,
    createdAt: '2025-12-08T16:45:00',
  },
];

const mockAppointmentsByConsultationType: AppointmentsByConsultationType = {
  VIDEO_CALL: 180,
  IN_PERSON: 65,
};

const mockCompletedAppointmentsByDoctor: CompletedAppointmentsByDoctor = {
  DOC001: 45,
  DOC002: 38,
  DOC003: 32,
  DOC004: 28,
  DOC005: 25,
};

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Appointment Statistics
 * Endpoint: GET /api/v1/appointments/admin/statistics
 */
export async function getAppointmentStatistics(
  params: { startDate: string; endDate: string }
): Promise<AppointmentStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getAppointmentStatistics', params);
  return mockAppointmentStatistics;
}

/**
 * Get Appointments By IDs
 * Endpoint: POST /api/v1/appointments/admin/by-ids
 */
export async function getAppointmentsByIds(
  appointmentIds: string[]
): Promise<Appointment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getAppointmentsByIds', appointmentIds);

  return mockAppointments.filter((apt) =>
    appointmentIds.includes(apt.appointmentId)
  );
}

/**
 * Get Stats By Consultation Type
 * Endpoint: GET /api/v1/appointments/admin/by-consultation-type
 */
export async function getStatsByConsultationType(
  params: { startDate: string; endDate: string }
): Promise<AppointmentsByConsultationType> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getStatsByConsultationType', params);
  return mockAppointmentsByConsultationType;
}

/**
 * Get Completed Appointments By Doctor
 * Endpoint: GET /api/v1/appointments/admin/by-doctor
 */
export async function getCompletedAppointmentsByDoctor(
  params: { startDate: string; endDate: string }
): Promise<CompletedAppointmentsByDoctor> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('API Call: getCompletedAppointmentsByDoctor', params);
  return mockCompletedAppointmentsByDoctor;
}

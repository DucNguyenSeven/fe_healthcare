'use client'

import { AppointmentAndConsultationModule } from '@/features/doctor'

export default function DoctorSchedule() {
  // Hiển thị lịch làm việc và đăng ký schedule
  return <AppointmentAndConsultationModule activeView="schedule" />
}

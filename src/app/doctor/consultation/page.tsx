'use client'

import { AppointmentAndConsultationModule } from '@/features/doctor'

export default function DoctorConsultation() {
  // Hiển thị giao diện tư vấn trực tuyến (video call)
  return <AppointmentAndConsultationModule activeView="consultation" />
}

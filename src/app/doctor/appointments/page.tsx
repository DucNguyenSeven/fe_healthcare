"use client";
import React from "react";
import { AppointmentAndConsultationModule } from "@/features/doctor/AppointmentAndConsultationModule";
import type { Appointment } from "@/features/doctor/HealthcarePlusApp";

export default function Page() {
  const appointments: Appointment[] = [
    {
      id: "a1",
      type: "online",
      service: "Tư vấn CKD giai đoạn 3",
      doctor: "BS. Trần Minh Hoàng",
      date: "2025-08-20",
      time: "10:00",
      status: "upcoming",
      canJoin: true,
    },
    {
      id: "a2",
      type: "direct",
      service: "Theo dõi định kỳ",
      doctor: "BS. Lê Thị Mai",
      date: "2025-08-18",
      time: "09:30",
      status: "completed",
    },
    {
      id: "a3",
      type: "online",
      service: "Tư vấn dinh dưỡng",
      doctor: "BS. Nguyễn Văn Đức",
      date: "2025-08-15",
      time: "14:00",
      status: "cancelled",
    },
  ];
  return <AppointmentAndConsultationModule activeView="appointments" />;
}

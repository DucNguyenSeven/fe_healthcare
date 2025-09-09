"use client";
import React from "react";
import { DoctorDashboardPage } from "@/features/doctor/DoctorDashboardPage";
import { MessageNotifier } from "@/components/common";
import type {
  User,
  Appointment,
  HealthMetric,
  Alert,
  NavigationItem,
} from "@/features/doctor/HealthcarePlusApp";

export default function Page() {
  const user: User = {
    id: "1",
    name: "Bác sĩ Demo",
    email: "doctor@example.com",
    phone: "000",
    ckdStage: 3,
    lastEgfr: 45,
    lastCreatinine: 1.8,
    lastBp: "120/80",
  };
  const appointments: Appointment[] = [
    {
      id: "1",
      type: "online",
      service: "Tư vấn",
      doctor: "Bạn",
      date: "2025-01-01",
      time: "10:00",
      status: "upcoming",
      canJoin: true,
    },
  ];
  const healthMetrics: HealthMetric[] = [
    {
      id: "1",
      type: "egfr",
      value: 45,
      date: "2025-01-01",
      unit: "mL/min/1.73m²",
      isAlert: true,
    },
  ];
  const alerts: Alert[] = [
    {
      id: "1",
      type: "info",
      title: "Chào mừng",
      message: "Bảng điều khiển bác sĩ",
      date: "2025-01-01",
      isRead: false,
    },
  ];
  const onNavigate = (_: NavigationItem) => {};
  return (
    <>
      <DoctorDashboardPage onNavigate={() => {}} />
      <MessageNotifier messageKey="loginSuccessMessage" />
    </>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";
import { MessageNotifier } from "@/components/common";

export default function PatientDashboardPage() {
  const router = useRouter();
  const {
    user,
    appointments,
    healthMetrics,
    alerts,
    consultations,
    reminders,
    articles,
  } = usePatient();

  const handleNavigate = (page: string) => {
    router.push(`/patient/${page}`);
  };

  return (
    <>
      <DashboardPage
        user={user}
        appointments={appointments}
        healthMetrics={healthMetrics}
        alerts={alerts}
        consultations={consultations}
        reminders={reminders}
        articles={articles}
        onNavigate={handleNavigate}
      />
      <MessageNotifier messageKey="loginSuccessMessage" />
    </>
  );
}

"use client";

import React from "react";
import { DashboardLayout, PatientInfoFormWrapper } from "@/features/patient";
import { PatientProvider } from "@/features/patient/context/PatientContext";
import { RoleGuard } from "@/components/common";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <RoleGuard allowedRoles={['PATIENT']} redirectToHome={true}>
      <PatientProvider>
        <PatientInfoFormWrapper>
          <DashboardLayout>{children}</DashboardLayout>
        </PatientInfoFormWrapper>
      </PatientProvider>
    </RoleGuard>
  );
}

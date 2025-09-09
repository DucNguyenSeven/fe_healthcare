"use client";

import React from "react";
import { DashboardLayout } from "@/features/patient";
import { PatientProvider } from "@/features/patient/context/PatientContext";
import AuthGuard from "@/components/common/AuthGuard";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <AuthGuard>
      <PatientProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </PatientProvider>
    </AuthGuard>
  );
}

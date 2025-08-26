"use client";

import React from "react";
import { DashboardLayout } from "@/features/patient";
import { PatientProvider } from "@/features/patient/context/PatientContext";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <PatientProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </PatientProvider>
  );
}

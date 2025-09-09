"use client";
import React from "react";
import "../globals.css";
import { DoctorLayout } from "@/features/doctor";
import { RoleGuard } from "@/components/common";

export default function DoctorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['DOCTOR']} redirectToHome={true}>
      <DoctorLayout>{children}</DoctorLayout>
    </RoleGuard>
  ) as React.ReactElement;
}

"use client";
import React from "react";
import "../globals.css";
import { DoctorLayout } from "@/features/doctor";
import AuthGuard from "@/components/common/AuthGuard";

export default function DoctorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DoctorLayout>{children}</DoctorLayout>
    </AuthGuard>
  ) as React.ReactElement;
}

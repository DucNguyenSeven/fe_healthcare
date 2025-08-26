"use client";
import React from "react";
import "../globals.css";
import { DoctorLayout } from "@/features/doctor";

export default function DoctorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (<DoctorLayout>{children}</DoctorLayout>) as React.ReactElement;
}

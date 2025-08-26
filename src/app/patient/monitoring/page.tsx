"use client";

import React from "react";
import { MonitoringPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";

export default function MonitoringPageRoute() {
  const { user, healthMetrics } = usePatient();
  return <MonitoringPage user={user} healthMetrics={healthMetrics} />;
}

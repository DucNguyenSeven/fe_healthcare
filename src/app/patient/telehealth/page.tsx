"use client";

import React from "react";
import { TelehealthPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";

export default function TelehealthPageRoute() {
  const { user, appointments } = usePatient();
  return <TelehealthPage user={user} appointments={appointments} />;
}

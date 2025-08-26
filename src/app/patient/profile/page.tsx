"use client";

import React from "react";
import { ProfileRecordsPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";

export default function ProfileRecordsPageRoute() {
  const { user } = usePatient();
  return <ProfileRecordsPage user={user} />;
}

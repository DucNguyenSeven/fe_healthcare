"use client";

import React from "react";
import { CommunityPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";

export default function CommunityPageRoute() {
  const { user } = usePatient();
  return <CommunityPage user={user} />;
}

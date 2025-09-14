"use client";

import React from "react";
import { AIAssistantPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";
import { usePatientNavigation } from "@/hooks/navigation/usePatientNavigation";

export default function AIAssistantPageRoute() {
  const { user } = usePatient();
  const { navigate } = usePatientNavigation();

  const handleNavigate = (page: string) => {
    navigate(page as any);
  };

  return <AIAssistantPage user={user} onNavigate={handleNavigate} />;
}

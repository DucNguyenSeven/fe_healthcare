"use client";

import React from "react";
import { AIAssistantPage } from "@/features/patient";
import { usePatient } from "@/hooks/usePatient";

export default function AIAssistantPageRoute() {
  const { user } = usePatient();
  return <AIAssistantPage user={user} />;
}

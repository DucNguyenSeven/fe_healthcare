"use client";

import { usePatientContext } from '@/features/patient/context/PatientContext';

export function usePatient() {
  return usePatientContext();
}



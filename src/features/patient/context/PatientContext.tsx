"use client";

import { createContext, useContext, ReactNode } from 'react';

interface PatientContextValue {
  patientId?: string;
}

const PatientContext = createContext<PatientContextValue | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const value: PatientContextValue = {};

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
}

"use client";

import React, { createContext, useContext, PropsWithChildren } from "react";
import { useGetMe } from "@/hooks/auth/useGetMe";
import {
  User,
  Appointment,
  HealthMetric,
  Alert,
  Consultation,
  MedicationReminder,
  Article,
} from "../types";
import {
  mockAppointments,
  mockHealthMetrics,
  mockAlerts,
  mockConsultations,
  mockMedicationReminders,
  mockArticles,
} from "@/data/global/patient.data";

export interface PatientState {
  user: User;
  appointments: Appointment[];
  healthMetrics: HealthMetric[];
  alerts: Alert[];
  consultations: Consultation[];
  reminders: MedicationReminder[];
  articles: Article[];
}

const defaultValue: PatientState = {
  user: {
    id: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
    ckdStage: 0,
    lastEgfr: 0,
    lastCreatinine: 0,
    lastBp: '',
  },
  appointments: mockAppointments,
  healthMetrics: mockHealthMetrics,
  alerts: mockAlerts,
  consultations: mockConsultations,
  reminders: mockMedicationReminders,
  articles: mockArticles,
};

const PatientContext = createContext<PatientState>(defaultValue);

export function PatientProvider({
  children,
  value,
}: PropsWithChildren<{ value?: Partial<PatientState> }>) {
  const { data: userData, isLoading, error } = useGetMe();
  
  // Transform API data to User type
  const user: User = userData ? {
    id: userData.userId,
    name: userData.fullName || '',
    email: userData.email,
    phone: userData.phone || '',
    avatar: userData.avatarUrl || '',
    ckdStage: 3, // Default value, should be fetched from medical data
    lastEgfr: 45, // Default value, should be fetched from medical data
    lastCreatinine: 1.8, // Default value, should be fetched from medical data
    lastBp: '140/90', // Default value, should be fetched from medical data
  } : defaultValue.user;

  const merged: PatientState = {
    ...defaultValue,
    user,
    ...value,
  } as PatientState;

  return (
    <PatientContext.Provider value={merged}>{children}</PatientContext.Provider>
  );
}

export function usePatientContext(): PatientState {
  return useContext(PatientContext);
}

"use client";

import React, { createContext, useContext, PropsWithChildren } from "react";
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
  mockUser,
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
  user: mockUser,
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
  const merged: PatientState = {
    ...defaultValue,
    ...value,
  } as PatientState;

  return (
    <PatientContext.Provider value={merged}>{children}</PatientContext.Provider>
  );
}

export function usePatientContext(): PatientState {
  return useContext(PatientContext);
}

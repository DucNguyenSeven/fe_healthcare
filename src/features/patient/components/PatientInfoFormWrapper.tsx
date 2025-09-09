"use client";

import React, { useEffect } from "react";
import { PatientInfoUpdateForm } from "./PatientInfoUpdateForm";
import { usePatientInfoForm, useProfileCompletion, PatientFormData } from "../hooks/usePatientInfoForm";
import { usePatientContext } from "../context/PatientContext";

interface PatientInfoFormWrapperProps {
  children: React.ReactNode;
}

export function PatientInfoFormWrapper({ children }: PatientInfoFormWrapperProps) {
  const { user } = usePatientContext();
  const { shouldShowFirstTimeForm } = useProfileCompletion(user);
  
  const {
    isFormOpen,
    isSubmitting,
    openForm,
    closeForm,
    submitForm,
  } = usePatientInfoForm({
    onSuccess: (data: PatientFormData) => {
      console.log("Patient info updated successfully:", data);
      // Here you would typically update the user context or make an API call
      // For now, we'll just close the form
    },
    onError: (error) => {
      console.error("Failed to update patient info:", error);
      // Here you would show an error notification
    },
  });

  // Auto-open form for first-time users
  useEffect(() => {
    if (shouldShowFirstTimeForm && !isFormOpen) {
      const timer = setTimeout(() => {
        openForm();
      }, 1000); // Show form after 1 second delay for better UX

      return () => clearTimeout(timer);
    }
  }, [shouldShowFirstTimeForm, isFormOpen, openForm]);

  return (
    <>
      {children}
      

      {/* Form Modal */}
      {isFormOpen && (
        <PatientInfoUpdateForm
          user={user}
          onSubmit={submitForm}
          onClose={shouldShowFirstTimeForm ? undefined : closeForm}
          isFirstTime={shouldShowFirstTimeForm}
        />
      )}
    </>
  );
}
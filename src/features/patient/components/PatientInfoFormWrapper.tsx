"use client";

import React, { useEffect } from "react";
import { PatientInfoUpdateForm } from "./PatientInfoUpdateForm";
import { usePatientInfoForm, useProfileCompletion, PatientFormData } from "../hooks/usePatientInfoForm";
import { usePatientContext } from "../context/PatientContext";
import { useAuthContext } from "../../../contexts/AuthContext";

interface PatientInfoFormWrapperProps {
  children: React.ReactNode;
}

export function PatientInfoFormWrapper({ children }: PatientInfoFormWrapperProps) {
  const { user: patientUser } = usePatientContext();
  const { user: authUser, isAuthenticated } = useAuthContext();
  const { shouldShowFirstTimeForm } = useProfileCompletion(authUser);
  
  const {
    isFormOpen,
    isSubmitting,
    openForm,
    closeForm,
    submitForm,
  } = usePatientInfoForm({
    onSuccess: (data: PatientFormData) => {
      // Here you would typically update the user context or make an API call
      // For now, we'll just close the form
    },
    onError: (error) => {
      console.error("Failed to update patient info:", error);
      // Here you would show an error notification
    },
  });

  const handleSkip = async () => {
    try {
      // Close form
      closeForm();
      
      // Optional: Send skip event to analytics/tracking service
      // await trackEvent('patient_info_form_skipped', { userId: authUser?.userId });
      
    } catch (error) {
      console.error('Error handling skip:', error);
      // Still close form even if logging fails
      closeForm();
    }
  };

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
          user={authUser ? {
            id: authUser.userId,
            name: authUser.name || '',
            email: authUser.email,
            phone: authUser.phone || '',
            avatar: authUser.avatar || ''
          } : undefined}
          onSubmit={submitForm}
          onClose={shouldShowFirstTimeForm ? undefined : closeForm}
          onSkip={shouldShowFirstTimeForm ? handleSkip : undefined}
          isFirstTime={shouldShowFirstTimeForm}
        />
      )}
    </>
  );
}
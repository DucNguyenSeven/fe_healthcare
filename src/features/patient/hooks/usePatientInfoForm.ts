"use client";

import { useState, useCallback } from "react";

export interface PatientFormData {
  avatar?: File | string;
  name: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  height: string;
  weight: string;
  bmi: string;
  bloodType: string;
}

export interface UsePatientInfoFormProps {
  onSuccess?: (data: PatientFormData) => void;
  onError?: (error: Error) => void;
  initialData?: Partial<PatientFormData>;
}

export function usePatientInfoForm({
  onSuccess,
  onError,
  initialData = {},
}: UsePatientInfoFormProps = {}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openForm = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const submitForm = useCallback(async (formData: PatientFormData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Handle avatar upload if it's a File
      let processedData = { ...formData };
      if (formData.avatar instanceof File) {
        // In a real app, you would upload the file and get a URL back
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', formData.avatar);
        // const response = await uploadAvatar(formDataUpload);
        // processedData.avatar = response.url;
        processedData.avatar = URL.createObjectURL(formData.avatar); // Temporary for demo
      }

      console.log("Patient info submitted:", processedData);
      onSuccess?.(processedData);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to submit patient info:", error);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, onError]);

  return {
    isFormOpen,
    isSubmitting,
    openForm,
    closeForm,
    submitForm,
    initialData,
  };
}

// Hook to check if user needs to complete profile
export function useProfileCompletion(user: any) {
  const isProfileIncomplete = !user?.name || !user?.phone || !user?.email;
  
  // Check if user has previously skipped the form with enhanced validation
  const hasSkippedForm = typeof window !== 'undefined' 
    ? (() => {
        try {
          const skipData = localStorage.getItem('patient_info_form_skipped');
          if (!skipData) return false;
          
          // Parse skip data
          const parsed = JSON.parse(skipData);
          
          // Check if skip data is valid and recent (within 30 days)
          if (parsed.skipped && parsed.timestamp) {
            const skipDate = new Date(parsed.timestamp);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            // If skip is older than 30 days, consider it expired
            if (skipDate < thirtyDaysAgo) {
              localStorage.removeItem('patient_info_form_skipped');
              return false;
            }
            
            // Check if skip is for current user - sử dụng userId từ AuthContext
            if (parsed.userId && user?.userId && parsed.userId !== user.userId) {
              return false;
            }
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Error parsing skip data:', error);
          // Clear invalid data
          localStorage.removeItem('patient_info_form_skipped');
          return false;
        }
      })()
    : false;
  
  // Only show form if profile is incomplete AND user hasn't skipped it before
  const shouldShowFirstTimeForm = isProfileIncomplete && !hasSkippedForm;

  return {
    isProfileIncomplete,
    shouldShowFirstTimeForm,
    hasSkippedForm,
  };
}
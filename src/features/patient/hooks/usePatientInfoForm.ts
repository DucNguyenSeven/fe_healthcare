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
  emergencyContact: string;
  emergencyPhone: string;
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
  const shouldShowFirstTimeForm = isProfileIncomplete;

  return {
    isProfileIncomplete,
    shouldShowFirstTimeForm,
  };
}
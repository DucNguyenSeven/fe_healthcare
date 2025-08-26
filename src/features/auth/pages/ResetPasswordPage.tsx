"use client";

import React, { useState } from "react";
import { Box, Alert, Snackbar } from "@mui/material";
import { ResetPasswordFormPanel } from "../components";
import { ResetPasswordFormData } from "../../../types";
import { useResetPassword } from "../../../hooks";

const ResetPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  const { resetPassword, isLoading, error, clearError } = useResetPassword();

  const handleInputChange =
    (field: keyof ResetPasswordFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    // Basic validation
    if (!formData.password || !formData.confirmPassword) {
      return;
    }

    await resetPassword(formData);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <ResetPasswordFormPanel
        formData={formData}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPasswordPage;

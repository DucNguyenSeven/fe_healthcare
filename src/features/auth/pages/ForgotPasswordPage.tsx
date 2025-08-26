"use client";

import React, { useState } from "react";
import { Box, Alert, Snackbar } from "@mui/material";
import { ForgotFormPanel } from "../components";
import { ForgotFormData } from "../../../types";
import { useForgotPassword } from "../../../hooks";

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ForgotFormData>({
    email: "",
  });

  const { sendResetOTP, isLoading, error, clearError } = useForgotPassword();

  const handleInputChange =
    (field: keyof ForgotFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    // Basic validation
    if (!formData.email) {
      return;
    }

    await sendResetOTP(formData);
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
      <ForgotFormPanel
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

export default ForgotPasswordPage;

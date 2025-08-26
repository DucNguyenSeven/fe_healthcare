"use client";

import React, { useState } from "react";
import { Box, useTheme, useMediaQuery, Alert, Snackbar } from "@mui/material";
import { RegisterFormPanel, RegisterHeroPanel } from "../components";
import { RegisterFormData } from "../../../types";
import { useRegister } from "../../../hooks";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    emailOrPhone: "",
    password: "",
    confirmPassword: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { register, isLoading, error, clearError } = useRegister();

  const handleInputChange =
    (field: keyof RegisterFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    // Basic validation
    if (
      !formData.emailOrPhone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return;
    }

    await register(formData);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Left Panel - Register Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : { md: "0 0 50%" },
          width: isMobile ? "100%" : "auto",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          py: { xs: 1, sm: 2, md: 3 },
          order: { xs: 1, md: 1 },
          overflow: "hidden",
        }}
      >
        <RegisterFormPanel
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Box>

      {/* Right Panel - Hero Section (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: { md: "0 0 50%" },
            height: "100vh",
            order: { md: 2 },
          }}
        >
          <RegisterHeroPanel />
        </Box>
      )}

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

export default RegisterPage;

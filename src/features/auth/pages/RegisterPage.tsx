"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, useTheme, useMediaQuery, Alert, Snackbar } from "@mui/material";
import { RegisterFormPanel, RegisterHeroPanel } from "../components";
import { useRegister, RegisterPayload } from "../../../hooks/auth";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterPayload & { confirmPassword: string }>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const registerMutation = useRegister();

  const handleInputChange =
    (field: keyof (RegisterPayload & { confirmPassword: string })) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return;
    }

    // Validation password confirmation (handled by RegisterFormPanel)
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // Chuyển đến trang OTP với email trong query params
      router.push(`/otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error("Registration failed:", error);
    }
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
          isLoading={registerMutation.isPending}
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
        open={!!registerMutation.error}
        autoHideDuration={6000}
        onClose={() => registerMutation.reset()}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => registerMutation.reset()} severity="error" sx={{ width: "100%" }}>
          {(registerMutation.error as Error)?.message || "Đã xảy ra lỗi"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;

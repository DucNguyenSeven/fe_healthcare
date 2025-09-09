"use client";

import React from "react";
import { Box, Alert, Snackbar } from "@mui/material";
import { OTPFormPanel, OTPHeroPanel } from "../components";
import { useOTP } from "@/hooks/useOTP";
import { useTheme, useMediaQuery } from "@mui/material";

const OTPForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    otpValues,
    activeIndex,
    email,
    otpFlow,
    isLoading,
    error,
    successMessage,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handleInputFocus,
    handleResendOTP,
    handleBackToLogin,
    handleSubmit,
    clearError,
    clearSuccess,
  } = useOTP();

  // Only render when email exists; hook keeps email from URL/session
  if (!email) {
    return null;
  }

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
      {/* Left Panel - OTP Form */}
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
        <OTPFormPanel
          otpValues={otpValues}
          activeIndex={activeIndex}
          email={email}
          otpFlow={otpFlow}
          isLoading={isLoading}
          inputRefs={inputRefs}
          onOtpChange={handleOtpChange}
          onKeyDown={handleKeyDown}
          onInputFocus={handleInputFocus}
          onResendOTP={handleResendOTP}
          onBackToLogin={handleBackToLogin}
          onSubmit={handleSubmit}
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
          <OTPHeroPanel />
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={1500}
        onClose={clearSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={clearSuccess} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OTPForgotPasswordPage;

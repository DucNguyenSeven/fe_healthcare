"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Alert, Snackbar } from "@mui/material";
import { OTPFormPanel, OTPHeroPanel } from "../components";
import { useVerifyAccount } from "../../../hooks/auth";
import { useTheme, useMediaQuery } from "@mui/material";

const OTPPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  // OTP state for individual boxes
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const verifyMutation = useVerifyAccount();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '');

    if (digit.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = digit;
      setOtpValues(newOtpValues);

      // Auto-focus next input if current input has value
      if (digit && index < 5) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    try {
      await verifyMutation.mutateAsync({ email, otp: otpCode });
      setSuccessMessage('Tài khoản đã được xác minh thành công! Bạn có thể đăng nhập.');
      // Chuyển đến trang login sau 2 giây
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Verification failed:', error);
      setErrorMessage((error as Error)?.message || 'Xác minh OTP thất bại. Vui lòng thử lại.');
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleResendOTP = async () => {
    try {
      // TODO: Implement resend OTP logic
      // For now, just show a message
      setErrorMessage('Tính năng gửi lại OTP sẽ được triển khai sau');
    } catch (error) {
      setErrorMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    }
  };

  if (!email) {
    return null; // Will redirect
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
          otpFlow="registration"
          isLoading={verifyMutation.isPending}
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar for validation */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar from API */}
      <Snackbar
        open={!!verifyMutation.error}
        autoHideDuration={6000}
        onClose={() => verifyMutation.reset()}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => verifyMutation.reset()} severity="error" sx={{ width: "100%" }}>
          {(verifyMutation.error as Error)?.message || "Đã xảy ra lỗi"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OTPPage;

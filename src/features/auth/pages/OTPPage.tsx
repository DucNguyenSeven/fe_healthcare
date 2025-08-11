"use client";

import React from 'react';
import { Box } from '@mui/material';
import { OTPFormPanel } from '../components';
import { useOTP } from '../../../hooks/useOTP';

const OTPPage: React.FC = () => {
  const {
    otpValues,
    activeIndex,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handleInputFocus,
    handleResendOTP,
    handleBackToLogin,
    handleSubmit,
  } = useOTP();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        px: { xs: 1, sm: 1.5, md: 2 },
        py: { xs: 1, sm: 1.5, md: 2 },
      }}
    >
      <OTPFormPanel
        otpValues={otpValues}
        activeIndex={activeIndex}
        inputRefs={inputRefs}
        onOtpChange={handleOtpChange}
        onKeyDown={handleKeyDown}
        onInputFocus={handleInputFocus}
        onResendOTP={handleResendOTP}
        onBackToLogin={handleBackToLogin}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default OTPPage;

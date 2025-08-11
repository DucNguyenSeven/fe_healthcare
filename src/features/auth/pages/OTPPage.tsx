"use client";

import React from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
import { OTPFormPanel } from '../components';
import { useOTP } from '../../../hooks/useOTP';

const OTPPage: React.FC = () => {
  const {
    otpValues,
    activeIndex,
    email,
    otpFlow,
    isLoading,
    error,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handleInputFocus,
    handleResendOTP,
    handleBackToLogin,
    handleSubmit,
    clearError,
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

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OTPPage;

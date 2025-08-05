"use client";

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ForgotFormPanel, ForgotHeroPanel } from '../components';

interface FormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Forgot password attempt:', formData);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Left Panel - Forgot Password Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : { md: '0 0 50%' },
          width: isMobile ? '100%' : 'auto',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          py: { xs: 1, sm: 2, md: 3 },
          order: { xs: 1, md: 1 },
          overflow: 'hidden',
        }}
      >
        <ForgotFormPanel
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </Box>

      {/* Right Panel - Hero Section (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: { md: '0 0 50%' },
            height: '100vh',
            order: { md: 2 },
          }}
        >
          <ForgotHeroPanel />
        </Box>
      )}
    </Box>
  );
};

export default ForgotPasswordPage; 
"use client";

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { RegisterFormPanel, RegisterHeroPanel } from '../components';
import { RegisterFormData } from '../../../types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (field: keyof RegisterFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    // TODO: Implement registration logic
    console.log('Registration attempt:', formData);
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
      {/* Left Panel - Register Form */}
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
        <RegisterFormPanel
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
          <RegisterHeroPanel />
        </Box>
      )}
    </Box>
  );
};

export default RegisterPage; 
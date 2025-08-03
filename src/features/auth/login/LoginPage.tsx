"use client";

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import LoginFormPanel from './components/LoginFormPanel';
import LoginHeroPanel from './components/LoginHeroPanel';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: field === 'rememberMe' ? event.target.checked : event.target.value,
    });
  };

  const handleSubmit = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt:', formData);
  };

  const handleSocialLogin = (provider: string): void => {
    // TODO: Implement social login logic
    console.log(`${provider} login clicked`);
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
      {/* Left Panel - Login Form */}
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
        <LoginFormPanel
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onSocialLogin={handleSocialLogin}
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
          <LoginHeroPanel />
        </Box>
      )}
    </Box>
  );
};

export default LoginPage; 
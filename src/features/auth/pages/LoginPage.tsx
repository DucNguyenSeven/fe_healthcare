"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Box, useTheme, useMediaQuery, Alert, Snackbar } from '@mui/material';
import { LoginFormPanel, LoginHeroPanel } from '../components';
import { LoginFormData } from '../../../types';
import { useAuth } from '../../../hooks';
import { useSearchParams } from 'next/navigation';

// Component that handles search params and must be wrapped in Suspense
const SuccessMessageHandler: React.FC<{ setSuccessMessage: (message: string | null) => void }> = ({ setSuccessMessage }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'registration-success') {
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
    } else if (message === 'password-reset-success') {
      setSuccessMessage('Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.');
    }
  }, [searchParams, setSuccessMessage]);

  return null;
};

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, isLoading, error, clearError } = useAuth();

  const handleInputChange = (field: keyof LoginFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: field === 'rememberMe' ? event.target.checked : event.target.value,
    });
  };

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      return;
    }

    await login({
      email: formData.email,
      password: formData.password,
    });
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
      {/* Handle success messages from URL params */}
      <Suspense fallback={null}>
        <SuccessMessageHandler setSuccessMessage={setSuccessMessage} />
      </Suspense>
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
          isLoading={isLoading}
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

      {/* Success Snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={8000} 
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage; 
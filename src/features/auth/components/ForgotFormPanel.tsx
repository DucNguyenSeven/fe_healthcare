"use client";

import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  MailOutline,
  ArrowBack,
  Person
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ForgotFormData {
  email: string;
}

interface ForgotFormPanelProps {
  formData?: ForgotFormData
  onInputChange?: (field: keyof ForgotFormData) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (event: React.SyntheticEvent) => void
}

const ForgotFormPanel: React.FC<ForgotFormPanelProps> = ({ formData, onInputChange, onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: 400,
          mx: 'auto',
          borderRadius: 4,
          backgroundColor: '#fff',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: isMobile ? 1.5 : 2 }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: isMobile ? 1 : 1.5,
            }}
          >
            <Typography
              variant="h4"
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              H+
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 700,
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              textTransform: 'uppercase',
            }}
          >
            HEALTHCARE
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            mb: isMobile ? 1 : 1.5,
            color: 'text.primary',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
          }}
        >
          Quên mật khẩu
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: isMobile ? 2 : 3,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
        </Typography>

        {/* Forgot Password Form */}
        <Box component="form" onSubmit={onSubmit}>
          {/* Email Field */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData?.email || ''}
            onChange={onInputChange?.('email')}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'grey.300',
                },
                '&:hover fieldset': {
                  borderColor: 'grey.400',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            required
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline sx={{ 
                    color: 'text.secondary', 
                    fontSize: '1.25rem' 
                  }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="medium"
            sx={{ 
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Gửi yêu cầu
          </Button>
        </Box>

        {/* Navigation Links */}
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
          {/* Back to Login Link */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: 'center',
            }}
          >
            <Button
              onClick={handleBackToLogin}
              variant="text"
              sx={{ 
                color: 'primary.main', 
                textDecoration: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <ArrowBack sx={{ fontSize: '0.875rem' }} />
              Quên mật khẩu? Đăng nhập
            </Button>
          </Typography>

          {/* Register Link */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: 'center',
            }}
          >
            <Button
              onClick={handleRegister}
              variant="text"
              sx={{ 
                color: 'primary.main', 
                textDecoration: 'none',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Person sx={{ fontSize: '0.875rem' }} />
              Không có tài khoản? Đăng ký
            </Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ForgotFormPanel; 
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
import { ForgotFormData } from '../../../types';

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
        py: { xs: 4, sm: 6, md: 8, lg: 10 }, // Tăng margin top và bottom cho màn hình lớn hơn
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 }, // Đồng bộ padding với Login
          width: '100%',
          maxWidth: 400, // Đồng bộ maxWidth với Login
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
        <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56, md: 64 }, // Đồng bộ kích thước logo với Login
              height: { xs: 48, sm: 56, md: 64 },
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            <Typography
              variant="h4"
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } // Đồng bộ font size với Login
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
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }, // Đồng bộ font size với Login
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
            mb: { xs: 1, sm: 1.5 }, // Đồng bộ margin với Login
            color: 'text.primary',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, // Đồng bộ font size với Login
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
            mb: { xs: 2, sm: 3 }, // Đồng bộ margin với Login
            fontSize: { xs: '0.875rem', sm: '1rem' }, // Đồng bộ font size với Login
          }}
        >
          Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
        </Typography>

        {/* Forgot Password Form */}
        <Box component="form" onSubmit={onSubmit} sx={{ mb: { xs: 2, sm: 2 } }}>
          {/* Email Field */}
          <TextField
            fullWidth
            id="forgot-email"
            name="email"
            label="Email"
            type="email"
            value={formData?.email || ''}
            onChange={onInputChange?.('email')}
            sx={{
              mb: 2, // Đồng bộ margin với Login
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline color="action" />
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
              mb: { xs: 1.5, sm: 2 }, // Đồng bộ margin với Login
              py: { xs: 1.25, sm: 1.5 }, // Đồng bộ padding với Login
              fontSize: { xs: '0.875rem', sm: '1rem' }, // Đồng bộ font size với Login
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Gửi yêu cầu
          </Button>
        </Box>

        {/* Navigation Links */}
        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ textAlign: 'center' }}>
          {/* Back to Login Link */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Đồng bộ font size với Login
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
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
              }}
            >
              <ArrowBack sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
              Quay lại đăng nhập
            </Button>
          </Typography>

          {/* Register Link */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Đồng bộ font size với Login
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
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
              }}
            >
              <Person sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
              Không có tài khoản? Đăng ký
            </Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ForgotFormPanel; 
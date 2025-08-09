"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  MailOutline, 
  LockOutlined, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface RegisterFormData {
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormPanelProps {
  formData?: RegisterFormData
  onInputChange?: (field: keyof RegisterFormData) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (event: React.SyntheticEvent) => void
}

const RegisterFormPanel: React.FC<RegisterFormPanelProps> = ({ formData, onInputChange, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLogin = () => {
    router.push('/login');
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
          Đăng ký tài khoản
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
          Tạo tài khoản để bắt đầu hành trình chăm sóc sức khỏe của bạn.
        </Typography>

        {/* Register Form */}
        <Box component="form" onSubmit={onSubmit}>
          {/* Email or Phone Field */}
          <TextField
            fullWidth
            label="Email hoặc số điện thoại"
            value={formData?.emailOrPhone || ''}
            onChange={onInputChange?.('emailOrPhone')}
            required
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline sx={{ color: 'text.secondary', fontSize: isMobile ? 16 : 18 }} />
                </InputAdornment>
              ),
            }}
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
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={formData?.password || ''}
            onChange={onInputChange?.('password')}
            required
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: 'text.secondary', fontSize: isMobile ? 16 : 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <Visibility sx={{ fontSize: isMobile ? 16 : 18 }} /> : <VisibilityOff sx={{ fontSize: isMobile ? 16 : 18 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          />

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            label="Xác nhận lại mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData?.confirmPassword || ''}
            onChange={onInputChange?.('confirmPassword')}
            required
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: 'text.secondary', fontSize: isMobile ? 16 : 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <Visibility sx={{ fontSize: isMobile ? 16 : 18 }} /> : <VisibilityOff sx={{ fontSize: isMobile ? 16 : 18 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            sx={{
              mt: 0.5,
              mb: 0,
              py: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 'bold',
              borderRadius: 2,
              minHeight: isMobile ? 32 : 36,
              height: isMobile ? 34 : 38,
            }}
          >
            Đăng ký
          </Button>
        </Box>

        {/* Login Link */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            textAlign: 'center',
            mt: { xs: 0.75, sm: 1.25 },
          }}
        >
          Đã có tài khoản?{' '}
          <Button
            onClick={handleLogin}
            variant="text"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              textTransform: 'none',
              p: 0,
              minWidth: 'auto',
            }}
          >
            Đăng nhập
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterFormPanel; 
"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Google, 
  Facebook, 
  MailOutline, 
  LockOutlined, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LoginFormData } from '../../../types';

interface LoginFormPanelProps {
  formData?: LoginFormData
  onInputChange?: (field: keyof LoginFormData) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (event: React.SyntheticEvent) => void
  onSocialLogin?: (provider: string) => void
}

const LoginFormPanel: React.FC<LoginFormPanelProps> = ({ formData, onInputChange, onSubmit, onSocialLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
          Đăng nhập
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
          Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
        </Typography>

        {/* Login Form */}
        <Box component="form" onSubmit={onSubmit}>
          {/* Email Field */}
          <TextField
            fullWidth
            id="login-email"
            name="email"
            label="Email"
            type="email"
            value={formData?.email || ''}
            onChange={onInputChange?.('email')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            id="login-password"
            name="password"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={formData?.password || ''}
            onChange={onInputChange?.('password')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Remember Me and Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: isMobile ? 1.5 : 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id="login-remember-me"
                  name="rememberMe"
                  checked={formData?.rememberMe || false}
                  onChange={onInputChange?.('rememberMe') || (() => {})}
                  color="primary"
                  size="small"
                />
              }
              label="Nhớ tôi"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            />
            <Button
              onClick={handleForgotPassword}
              variant="text"
              sx={{ 
                color: 'primary.main', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
              }}
            >
              Quên mật khẩu?
            </Button>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="medium"
            sx={{ 
              mb: isMobile ? 1.5 : 2,
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Đăng nhập
          </Button>
        </Box>

        {/* Social Login Divider */}
        <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
          <Divider sx={{ mb: isMobile ? 1 : 1.5 }}>
            <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: 1,
              }}
            >
              Hoặc đăng nhập bằng
            </Typography>
          </Divider>
        </Box>

        {/* Social Login Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            justifyContent: 'center',
            mb: isMobile ? 1.5 : 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => onSocialLogin?.('google')}
            startIcon={<Google />}
            size="medium"
            sx={{
              borderRadius: 2,
              borderColor: 'grey.300',
              color: 'text.primary',
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 1.5, sm: 2 },
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50',
              },
            }}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSocialLogin?.('facebook')}
            startIcon={<Facebook />}
            size="medium"
            sx={{
              borderRadius: 2,
              borderColor: 'grey.300',
              color: 'text.primary',
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 1.5, sm: 2 },
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50',
              },
            }}
          >
            Facebook
          </Button>
        </Box>

        {/* Don't have account link */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            textAlign: 'center',
          }}
        >
          Chưa có tài khoản?{' '}
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
            Đăng ký ngay
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginFormPanel; 
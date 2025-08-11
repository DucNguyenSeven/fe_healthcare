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
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  LockOutlined,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ResetPasswordFormData } from '../../../types';

interface ResetPasswordFormPanelProps {
  formData?: ResetPasswordFormData;
  isLoading?: boolean;
  onInputChange?: (field: keyof ResetPasswordFormData) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.SyntheticEvent) => void;
}

const ResetPasswordFormPanel: React.FC<ResetPasswordFormPanelProps> = ({ 
  formData, 
  isLoading, 
  onInputChange, 
  onSubmit 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
        py: { xs: 4, sm: 6, md: 8, lg: 10 },
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
        <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2 } }}>
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
              mb: { xs: 1, sm: 1.5 },
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
            mb: { xs: 1, sm: 1.5 },
            color: 'text.primary',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
          }}
        >
          Đặt lại mật khẩu
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </Typography>

        {/* Reset Password Form */}
        <Box component="form" onSubmit={onSubmit} sx={{ mb: { xs: 2, sm: 2 } }}>
          {/* Password Field */}
          <TextField
            fullWidth
            id="reset-password"
            name="password"
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            value={formData?.password || ''}
            onChange={onInputChange?.('password')}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
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
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            id="reset-confirm-password"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData?.confirmPassword || ''}
            onChange={onInputChange?.('confirmPassword')}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
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
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
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
            disabled={isLoading}
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </Button>
        </Box>

        {/* Navigation Links */}
        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ textAlign: 'center' }}>
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
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
              }}
            >
              <ArrowBack sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
              Quay lại đăng nhập
            </Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ResetPasswordFormPanel;

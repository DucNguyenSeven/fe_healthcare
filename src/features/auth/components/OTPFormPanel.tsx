"use client";

import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';

interface OTPFormPanelProps {
  otpValues: string[];
  activeIndex: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: React.KeyboardEvent<HTMLDivElement>) => void;
  onInputFocus: (index: number) => void;
  onResendOTP: () => void;
  onBackToLogin: () => void;
  onSubmit: (event: React.SyntheticEvent) => void;
}

const OTPFormPanel: React.FC<OTPFormPanelProps> = ({ 
  otpValues,
  activeIndex,
  inputRefs,
  onOtpChange,
  onKeyDown,
  onInputFocus,
  onResendOTP,
  onBackToLogin,
  onSubmit
}) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3, md: 3.5 },
        width: '100%',
        maxWidth: { xs: 380, sm: 400, md: 420 },
        mx: 'auto',
        borderRadius: 3,
        backgroundColor: '#fff',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Logo */}
      <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            width: { xs: 48, sm: 52, md: 56 },
            height: { xs: 48, sm: 52, md: 56 },
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
              fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' }
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
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
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
          mb: { xs: 1, sm: 1.25 },
          color: 'text.primary',
          fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
        }}
      >
        Nhập mã OTP
      </Typography>

      {/* Instructions */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          mb: { xs: 2, sm: 2.5 },
          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
          lineHeight: 1.5,
          px: { xs: 0.5, sm: 1 },
        }}
      >
        Chúng tôi sẽ gửi cho bạn một{' '}
        <Box
          component="span"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          đoạn mã ở trong email
        </Box>
        {' '}của bạn vui lòng kiểm tra email và nhập mã xuống ô bên dưới
      </Typography>

      {/* OTP Input Fields */}
      <Box component="form" onSubmit={onSubmit}>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.25 },
            justifyContent: 'center',
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          {otpValues.map((value, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={value}
              onChange={(e) => onOtpChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onFocus={() => onInputFocus(index)}
              inputProps={{
                maxLength: 1,
                style: { textAlign: 'center' },
              }}
              sx={{
                width: { xs: 42, sm: 45, md: 48 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '1.25rem', sm: '1.375rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                },
              }}
            />
          ))}
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="medium"
          sx={{ 
            mb: { xs: 2, sm: 2.5 },
            py: { xs: 1.25, sm: 1.375 },
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            fontWeight: 'bold',
            borderRadius: 2,
          }}
        >
          Xác nhận
        </Button>
      </Box>

      {/* Resend OTP */}
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
          textAlign: 'center',
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        Bạn không nhận được mã xác thực OTP?{' '}
        <Button
          onClick={onResendOTP}
          variant="text"
          sx={{ 
            color: 'primary.main', 
            textDecoration: 'none',
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            textTransform: 'none',
            p: 0,
            minWidth: 'auto',
          }}
        >
          Gửi lại mã OTP
        </Button>
      </Typography>

      {/* Back to Login */}
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
          textAlign: 'center',
        }}
      >
        <Button
          onClick={onBackToLogin}
          variant="text"
          sx={{ 
            color: 'primary.main', 
            textDecoration: 'none',
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            textTransform: 'none',
            p: 0,
            minWidth: 'auto',
          }}
        >
          Quay lại đăng nhập
        </Button>
      </Typography>
    </Paper>
  );
};

export default OTPFormPanel;

'use client';

import React from 'react';
import { Box, Typography, IconButton, Stack, Avatar } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

interface ChatHeaderProps {
  onBack?: () => void;
  loading?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, loading = false }) => {
  return (
    <Box
      sx={{
        height: { xs: 48, sm: 56 },
        px: { xs: 1, sm: 1.5 },
        borderBottom: 1,
        borderColor: 'grey.100',
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Left: Back Button */}
      <IconButton
        onClick={onBack}
        aria-label="Quay lại"
        size="small"
        sx={{ color: 'text.secondary' }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      {/* Center: Title and Subtitle */}
      <Box sx={{ textAlign: 'center', flex: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'blueDark',
            mb: 0.5,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Trợ lý AI
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {loading ? 'AI đang trả lời...' : 'Người bạn đồng hành chăm sóc sức khỏe cá nhân của bạn'}
        </Typography>
      </Box>

      {/* Right: User Avatar and Name */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'primary.main',
            fontSize: '0.75rem',
            fontWeight: 'medium'
          }}
        >
          Đ
        </Avatar>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: 'text.primary'
          }}
        >
          Đức
        </Typography>
      </Stack>
    </Box>
  );
}; 
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ROUTES } from '@/constants/routes';

interface ChatHeaderProps {
  onBack?: () => void;
  loading?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack }) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      // Use replace with scroll: false to prevent auto-scroll warnings
      router.replace(ROUTES.HOME, { scroll: false });
      // Force scroll to top without smooth behavior
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <Box
      sx={{
        height: 64,
        px: { xs: 2, md: 3 },
        borderBottom: '1px solid #E5E7EB',
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative', // Changed from 'sticky' to 'relative'
        zIndex: 10,
        flexShrink: 0,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Left: back icon + logo + "Chatbot AI" */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          onClick={handleBackClick}
          sx={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 1,
            '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          <ArrowBackIcon sx={{ color: '#666', fontSize: '1.25rem' }} />
        </Box>
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: '#1E40AF', 
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          C
        </Avatar>
        <Typography
          variant="h6"
          component="span" // Changed from default 'h6' to 'span' to avoid heading semantics
          sx={{
            fontWeight: 700,
            color: '#1E40AF',
            fontSize: '1.25rem'
          }}
        >
          Chatbot AI
        </Typography>
      </Stack>
      
      {/* Right: user name + avatar */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography
          variant="body2"
          sx={{ 
            fontWeight: 700, 
            color: '#1E40AF',
            fontSize: '0.875rem'
          }}
        >
          Đức
        </Typography>
        <Avatar sx={{ 
          width: 32, 
          height: 32, 
          bgcolor: '#F3F4F6', 
          color: '#374151' 
        }}>
          <PersonIcon fontSize="small" />
        </Avatar>
      </Stack>
    </Box>
  );
};
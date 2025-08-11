import React from 'react';
import { Box, Typography } from '@mui/material';

export const EmptyState: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        textAlign: 'center'
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 1,
          color: '#1976D2',
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        Trợ lý AI
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: '#666',
          maxWidth: { xs: '100%', sm: '60ch' },
          lineHeight: 1.5,
          fontSize: '0.875rem'
        }}
      >
        Chào mừng bạn đến với trợ lý ảo sức khỏe của bạn
      </Typography>
    </Box>
  );
}; 
import React from 'react';
import { Box, Avatar, Paper } from '@mui/material';
import { keyframes } from '@mui/system';

// Keyframes for typing animation
const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

export const TypingIndicator: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
        px: { xs: 1, sm: 2 },
        mt: 1
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '75%'
        }}
      >
        {/* AI Avatar */}
        <Avatar
          sx={{
            bgcolor: '#374151',
            color: 'white',
            width: 32,
            height: 32,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            flexShrink: 0
          }}
        >
          AI
        </Avatar>
        
        {/* Typing bubble */}
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: 'white',
            color: '#374151',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            animation: `${pulse} 2s ease-in-out infinite`
          }}
        >
          {/* Typing dots */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center'
            }}
          >
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#6B7280',
                  animation: `${bounce} 1.4s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`
                }}
              />
            ))}
          </Box>
          
          {/* "AI đang suy nghĩ..." text - hide on mobile */}
          <Box
            component="span"
            sx={{
              fontSize: '0.8rem',
              color: '#6B7280',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
              display: { xs: 'none', sm: 'block' },
              ml: 1
            }}
          >
            AI đang suy nghĩ...
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

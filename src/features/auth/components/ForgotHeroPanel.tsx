import React from 'react';
import { Box, Typography } from '@mui/material';
import { Email } from '@mui/icons-material';

const ForgotHeroPanel: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      }}
    >
      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Envelope Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 80, sm: 100, md: 120, lg: 140 },
            height: { xs: 80, sm: 100, md: 120, lg: 140 },
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            mb: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Email
            sx={{
              color: 'white',
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 600,
            textAlign: 'center',
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: {
              xs: '1.5rem',
              sm: '2rem',
              md: '2.5rem',
              lg: '3rem',
              xl: '3.5rem',
            },
            lineHeight: 1.2,
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          }}
        >
          Secure Recovery
        </Typography>

        {/* Description Text */}
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: { xs: '100%', sm: '90%', md: 600, lg: 700 },
            mb: { xs: 3, sm: 4, md: 5 },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontSize: {
                xs: '0.875rem',
                sm: '1rem',
                md: '1.125rem',
                lg: '1.25rem',
              },
              lineHeight: 1.6,
              fontWeight: 400,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              opacity: 0.9,
            }}
          >
            We help you recover access to your account safely and quickly. Your information is always protected.
          </Typography>
        </Box>

        {/* Bottom Quote */}
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: { xs: '100%', sm: '90%', md: '80%', lg: '70%' },
            mt: 'auto',
            pt: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontStyle: 'italic',
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                md: '1rem',
                lg: '1.125rem',
              },
              lineHeight: 1.4,
              opacity: 0.8,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
            }}
          >
            &quot;Health is the most valuable asset of a person&quot; – HealthCare Team
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotHeroPanel; 
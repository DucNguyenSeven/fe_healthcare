'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

const heroDoctorImage = '/assets/images/hero_doctor1.png';

interface HeroSectionProps {
  id?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ id = 'home' }) => {
  const router = useRouter();

  return (
    <Box
      id={id}
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundImage: `url(${heroDoctorImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Dark overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />
      
      {/* Content Container */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          width: '100%', 
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: { xs: 2, sm: 3, md: 4 },
          height: '100%',
        }}
      >
        <Stack 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          sx={{ 
            maxWidth: { xs: '100%', sm: '90%', md: '70%', lg: '60%' },
            width: '100%',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              fontSize: { 
                xs: '1.75rem', 
                sm: '2rem', 
                md: '2.5rem', 
                lg: '3rem',
                xl: '3.5rem'
              },
              lineHeight: 1.1,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
              letterSpacing: '-0.02em',
              mb: { xs: 1, sm: 2 },
              mt: 0,
            }}
          >
            Hệ thống quản lý sức khỏe thận
          </Typography>

          <Typography
            variant="h3"
            sx={{
              color: 'primary.light',
              fontWeight: 700,
              fontSize: { 
                xs: '1.1rem', 
                sm: '1.25rem', 
                md: '1.5rem',
                lg: '1.75rem'
              },
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
              mb: { xs: 1, sm: 2 },
            }}
          >
            Healthcare+
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              lineHeight: 1.6,
              color: 'white',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
              maxWidth: { xs: '100%', md: '450px', lg: '500px' },
              mb: { xs: 2, sm: 3 },
            }}
          >
            Chúng tôi đồng hành cùng bạn trong hành trình kiểm soát bệnh thận, 
            từ theo dõi chỉ số đến tư vấn điều trị an toàn.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ mt: 1 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                console.log('Hero login button clicked');
                router.push(ROUTES.LOGIN);
              }}
              sx={{
                py: { xs: 1.25, md: 1.5 },
                px: { xs: 2.5, md: 3 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                width: { xs: '200px', sm: 'auto' },
                minWidth: { xs: '200px', sm: 'auto' },
                alignSelf: { xs: 'center', sm: 'flex-start' },
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Đăng nhập
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection; 
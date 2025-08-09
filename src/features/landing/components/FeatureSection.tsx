'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import Image from 'next/image';
import { features, Feature } from '../data/features.data';
import MobileSlider from './MobileSlider';
import DesktopFeatureGrid from './DesktopFeatureGrid';

interface FeatureSectionProps {
  id?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ id = 'services' }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const renderFeatureCard = (feature: Feature) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        minHeight: '280px',
        position: 'relative',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              backgroundColor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              flexShrink: 0,
            }}
          >
            <Image
              src={feature.icon}
              alt={feature.title}
              width={32}
              height={32}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem', flexShrink: 0 }}>
            {feature.title}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary', 
            lineHeight: 1.6, 
            flexGrow: 1, 
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}>
            {feature.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box
      id={id}
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: 'background.default',
        overflow: 'visible',
        width: '100%',
        maxWidth: '100vw',
        scrollMarginTop: { xs: '56px', sm: '64px' },
      }}
    >
      <Container maxWidth="lg" sx={{ overflow: 'visible', maxWidth: '100%' }}>
        <Stack spacing={3} alignItems="center" sx={{ width: '100%', overflow: 'visible' }}>
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', maxWidth: '800px' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                mb: 2,
                color: 'primary.main',
                mt: 0,
              }}
            >
              Dịch vụ của chúng tôi
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              Chúng tôi cung cấp các dịch vụ toàn diện để hỗ trợ bạn trong hành trình quản lý sức khỏe thận
            </Typography>
          </Box>

          {/* Features Grid/Slider */}
          {isMdUp ? (
            <DesktopFeatureGrid features={features} />
          ) : (
            <MobileSlider 
              items={features} 
              renderItem={renderFeatureCard}
              ariaLabel="Feature carousel"
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default FeatureSection;

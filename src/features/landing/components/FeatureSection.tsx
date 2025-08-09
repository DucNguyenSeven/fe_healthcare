'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { features } from '../data/features.data';
import MobileFeatureSlider from './MobileFeatureSlider';
import DesktopFeatureGrid from './DesktopFeatureGrid';

interface FeatureSectionProps {
  id?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ id = 'services' }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      id={id}
      sx={{
        py: { xs: 6, md: 8, lg: 10 },
        backgroundColor: 'background.default',
        overflow: 'visible',
        width: '100%',
        maxWidth: '100vw',
        scrollMarginTop: { xs: '56px', sm: '64px' },
      }}
    >
      <Container maxWidth="lg" sx={{ overflow: 'visible', maxWidth: '100%' }}>
        <Stack spacing={6} alignItems="center" sx={{ width: '100%', overflow: 'visible' }}>
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
            <MobileFeatureSlider features={features} />
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default FeatureSection;

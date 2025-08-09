'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { Feature } from '../data/features.data';
import { useMobileSlider } from '@/hooks/useMobileSlider';

interface MobileFeatureSliderProps {
  features: Feature[];
}

const MobileFeatureSlider: React.FC<MobileFeatureSliderProps> = ({ features }) => {
  const { containerRef, activeIndex } = useMobileSlider({
    itemsCount: features.length,
    autoScrollInterval: 3000,
    slideWidthRatio: 1.0,
    enableAutoScroll: false,
  });

  return (
    <Box sx={{ width: '100%', overflow: 'visible', maxWidth: '100vw' }}>
      <Box
        ref={containerRef}
        role="region"
        aria-label="Feature carousel"
        sx={{
          display: 'flex',
          gap: 0,
          px: 0,
          py: 4,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxWidth: '100%',
          '&::-webkit-scrollbar': { 
            display: 'none',
            width: 0,
            height: 0,
          },
          '&::-webkit-scrollbar-track': {
            display: 'none',
          },
          '&::-webkit-scrollbar-thumb': {
            display: 'none',
          },
        }}
      >
        {features.map((feature: Feature) => (
          <Box key={feature.id} sx={{ 
            flex: '0 0 100%', 
            scrollSnapAlign: 'start', 
            minWidth: 0, 
            py: 4, 
            px: 2,
            width: '100%',
          }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                  zIndex: 10,
                },
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
          </Box>
        ))}
      </Box>

      {/* Dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }} aria-hidden>
        {features.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: i === activeIndex ? 'primary.main' : 'grey.400',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MobileFeatureSlider;

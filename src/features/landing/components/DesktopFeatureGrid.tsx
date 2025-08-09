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

interface DesktopFeatureGridProps {
  features: Feature[];
}

const DesktopFeatureGrid: React.FC<DesktopFeatureGridProps> = ({ features }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 4,
        width: '100%',
        py: 4,
      }}
    >
      {features.map((feature: Feature) => (
        <Card
          key={feature.id}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
            },
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
      ))}
    </Box>
  );
};

export default DesktopFeatureGrid;

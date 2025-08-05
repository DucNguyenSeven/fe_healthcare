'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import Image from 'next/image';
import { features, Feature } from '../data/features.data';

interface FeatureSectionProps {
  id?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ id = 'services' }) => {
  return (
    <Box
      id={id}
      sx={{
        py: { xs: 6, md: 8, lg: 10 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center">
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', maxWidth: '800px' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                mb: 2,
                color: 'primary.main',
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

          {/* Features Grid */}
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
            }}
          >
            {features.map((feature: Feature) => (
              <Card
                key={feature.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Stack spacing={2}>
                    {/* Icon */}
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
                      }}
                    >
                      <Image
                        src={feature.icon}
                        alt={feature.title}
                        width={32}
                        height={32}
                        style={{
                          filter: 'brightness(0) invert(1)',
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '1.1rem',
                      }}
                    >
                      {feature.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        flexGrow: 1,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default FeatureSection;

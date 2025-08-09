'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoctorCard from '../../../components/common/DoctorCard';
import { doctorList, Doctor } from '../../../data/global/doctor.data';
import MobileSlider from './MobileSlider';

interface DoctorSectionProps {
  id?: string;
}

const DoctorSection: React.FC<DoctorSectionProps> = ({ id = 'doctors' }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Extract initials from doctor's name
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const renderDoctorCard = (doctor: Doctor) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        minHeight: '320px',
        maxHeight: '380px',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ 
        p: 3, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        '&:last-child': {
          pb: 3,
        },
      }}>
        <Stack spacing={2} sx={{ height: '100%', width: '100%' }}>
          {/* Circular Avatar */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: 'primary.main',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            }}
          >
            {getInitials(doctor.name)}
          </Avatar>

          {/* Doctor Name */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.1rem',
              lineHeight: 1.2,
            }}
          >
            {doctor.name}
          </Typography>

          {/* Specialty */}
          <Chip
            label={doctor.specialty}
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.main',
              fontWeight: 500,
              fontSize: '0.8rem',
              height: 28,
            }}
          />

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.4,
              flexGrow: 1,
              fontSize: '0.8rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
            }}
          >
            {doctor.description}
          </Typography>

          {/* Experience */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <AccessTimeIcon
              sx={{
                fontSize: '1rem',
                mr: 0.5,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {doctor.experience}
            </Typography>
          </Box>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="small"
            sx={{
              width: '100%',
              py: 1,
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            Đặt lịch khám
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box
      id={id}
      sx={{
        backgroundColor: 'background.default',
        scrollMarginTop: { xs: '56px', sm: '64px' },
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 6 }, 
        overflow: 'visible',
        position: 'relative',
        scrollSnapAlign: 'start',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 1.5,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              mt: 0,
            }}
          >
            Gặp gỡ đội ngũ bác sĩ chuyên môn
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.4,
            }}
          >
            Đội ngũ bác sĩ giàu kinh nghiệm, chuyên sâu trong từng lĩnh vực để mang đến dịch vụ chăm sóc tốt nhất
          </Typography>
        </Box>

        {/* Doctors Grid/Slider */}
        {isMdUp ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: { md: 2.5, lg: 3 },
              alignItems: 'stretch',
              justifyContent: 'center',
              maxWidth: '100%',
            }}
          >
            {doctorList.map((doctor, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  minHeight: '320px',
                  maxHeight: '380px',
                }}
              >
                <DoctorCard doctor={doctor} />
              </Box>
            ))}
          </Box>
        ) : (
          <MobileSlider 
            items={doctorList} 
            renderItem={renderDoctorCard}
            ariaLabel="Doctor carousel"
          />
        )}
      </Container>
    </Box>
  );
};

export default DoctorSection; 
import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import DoctorCard from '../../../components/common/DoctorCard';
import { doctorList } from '../../../data/global/doctor.data';

interface DoctorSectionProps {
  id?: string;
}

const DoctorSection: React.FC<DoctorSectionProps> = ({ id = 'doctors' }) => {
  return (
    <Box
      id={id}
      sx={{
        backgroundColor: 'background.default',
        scrollMarginTop: { xs: '72px', md: '80px' }, 
        pt: { xs: 1, md: 2 },
        pb: { xs: 8, md: 10 }, 
        overflow: 'visible',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',   // quan trọng
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, md: 4 },
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

        {/* Doctors Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
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
      </Container>
    </Box>
  );
};

export default DoctorSection; 
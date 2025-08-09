import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../../../layouts/MainLayout';
import { 
  HeroSection,
  FeatureSection,
  DoctorSection,
  FeedbackSection,
  FAQSection,
  FooterSection
} from '../components';

const LandingPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
        <HeroSection />
        <FeatureSection />
        <DoctorSection />
        <FeedbackSection />
        <FAQSection />
        <FooterSection />
      </Box>
    </MainLayout>
  );
};

export default LandingPage;

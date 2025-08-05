import React from 'react';
import { Box } from '@mui/material';
import Header from '../../../layouts/Header';
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
    <Box sx={{ width: '100%' }}>
      <Header />
      <HeroSection />
      <FeatureSection />
      <DoctorSection />
      <FeedbackSection />
      <FAQSection />
      <FooterSection />
    </Box>
  );
};

export default LandingPage;

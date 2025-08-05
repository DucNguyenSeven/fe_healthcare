import React from 'react';
import { Box } from '@mui/material';
import Header from '../../../layouts/Header';
import { HeroSection } from '../../../components/landing';
import FeatureSection from '../../../components/landing/FeatureSection';
import DoctorSection from '../../../components/landing/DoctorSection';
import FeedbackSection from '../../../components/landing/FeedbackSection';
import FAQSection from '../../../components/landing/FAQSection';
import FooterSection from '../../../components/landing/FooterSection';

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

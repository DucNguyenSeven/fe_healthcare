import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../../../layouts/MainLayout';
import { MessageNotifier } from '../../../components/common';
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
        <HeroSection id="home" />
        <FeatureSection id="services" />
        <DoctorSection id="doctors" />
        <FeedbackSection id="reviews" />
        <FAQSection id="faq" />
        <FooterSection />
      </Box>
      <MessageNotifier messageKey="logoutSuccessMessage" />
    </MainLayout>
  );
};

export default LandingPage;
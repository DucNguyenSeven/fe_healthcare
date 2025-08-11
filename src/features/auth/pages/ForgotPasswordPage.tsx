"use client";

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ForgotFormPanel } from '../components';
import { ForgotFormData } from '../../../types';

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ForgotFormData>({
    email: '',
  });

  const handleInputChange = (field: keyof ForgotFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Forgot password attempt:', formData);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <ForgotFormPanel
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default ForgotPasswordPage; 
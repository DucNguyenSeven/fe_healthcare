"use client";

import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header/index';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <CssBaseline />
      <Header />

      {/* Main content - no spacer needed for sticky header */}
      <Box component="main" sx={{ minHeight: 'auto', overflowX: 'hidden' }}>
        {children}
      </Box>
    </>
  );
}

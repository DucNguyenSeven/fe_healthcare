"use client";

import React from 'react';
import { Toolbar, Box, CssBaseline } from '@mui/material';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <CssBaseline />
      <Header />

      {/* Keep exactly ONE spacer below the fixed header */}
      <Toolbar />

      {/* Main content must not force extra vertical space */}
      <Box component="main" sx={{ minHeight: 'auto', overflowX: 'hidden' }}>
        {children}
      </Box>
    </>
  );
}

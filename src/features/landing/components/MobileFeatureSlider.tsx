'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import { Feature } from '../data/features.data';
import { useMobileSlider } from '@/hooks/useMobileSlider';

interface MobileFeatureSliderProps {
  features: Feature[];
}

const MobileFeatureSlider: React.FC<MobileFeatureSliderProps> = ({ features }) => {
  const { containerRef } = useMobileSlider({
    itemsCount: features.length,
    autoScrollInterval: 3000,
    slideWidthRatio: 1.0,
    enableAutoScroll: false,
  });

  // Local state to track current active index more accurately
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index when activeIndex changes or on scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateCurrentIndex = () => {
      const slideWidth = el.clientWidth;
      const scrollLeft = el.scrollLeft;
      const newIndex = Math.round(scrollLeft / slideWidth);
      setCurrentIndex(Math.min(Math.max(newIndex, 0), features.length - 1));
    };

    // Initial update
    updateCurrentIndex();

    // Add scroll listener
    el.addEventListener('scroll', updateCurrentIndex, { passive: true });
    return () => el.removeEventListener('scroll', updateCurrentIndex);
  }, [containerRef, features.length]);

  const handlePrevious = () => {
    const el = containerRef.current;
    if (!el) return;
    
    const slideWidth = el.clientWidth;
    const currentScroll = el.scrollLeft;
    const targetScroll = Math.max(0, currentScroll - slideWidth);
    
    el.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleNext = () => {
    const el = containerRef.current;
    if (!el) return;
    
    const slideWidth = el.clientWidth;
    const currentScroll = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const targetScroll = Math.min(maxScroll, currentScroll + slideWidth);
    
    el.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <Box sx={{ width: '100%', overflow: 'visible', maxWidth: '100vw', position: 'relative' }}>
      {/* Navigation Buttons - Only show if there are multiple features */}
      {features.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            pointerEvents: 'none',
          }}
        >
          {/* Previous Button - Show on the left when not at first card */}
          <Box sx={{ flex: '0 0 auto' }}>
            {currentIndex > 0 && (
              <IconButton
                onClick={handlePrevious}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                  pointerEvents: 'auto',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            )}
          </Box>

          {/* Next Button - Show on the right when not at last card */}
          <Box sx={{ flex: '0 0 auto' }}>
            {currentIndex < features.length - 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                  pointerEvents: 'auto',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      <Box
        ref={containerRef}
        role="region"
        aria-label="Feature carousel"
        sx={{
          display: 'flex',
          gap: 0,
          px: 0,
          py: 4,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxWidth: '100%',
          '&::-webkit-scrollbar': { 
            display: 'none',
            width: 0,
            height: 0,
          },
          '&::-webkit-scrollbar-track': {
            display: 'none',
          },
          '&::-webkit-scrollbar-thumb': {
            display: 'none',
          },
        }}
      >
        {features.map((feature: Feature) => (
          <Box key={feature.id} sx={{ 
            flex: '0 0 100%', 
            scrollSnapAlign: 'start', 
            minWidth: 0, 
            py: 4, 
            px: 2,
            width: '100%',
          }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                // Remove hover effects on mobile to avoid covering navigation buttons
                minHeight: '280px',
                position: 'relative',
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={32}
                      height={32}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem', flexShrink: 0 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1.6, 
                    flexGrow: 1, 
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                  }}>
                    {feature.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }} aria-hidden>
        {features.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: i === currentIndex ? 'primary.main' : 'grey.400',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MobileFeatureSlider;

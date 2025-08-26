"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { Box, IconButton } from "@mui/material";
import { useMobileSlider } from "@/hooks/useMobileSlider";

interface MobileSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  ariaLabel?: string;
}

const MobileSlider = <T extends { id?: number | string }>({
  items,
  renderItem,
  ariaLabel = "Carousel",
}: MobileSliderProps<T>) => {
  const { containerRef } = useMobileSlider({
    itemsCount: items.length,
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
      setCurrentIndex(Math.min(Math.max(newIndex, 0), items.length - 1));
    };

    // Initial update
    updateCurrentIndex();

    // Add scroll listener
    el.addEventListener("scroll", updateCurrentIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateCurrentIndex);
  }, [containerRef, items.length]);

  const handlePrevious = () => {
    const el = containerRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth;
    const currentScroll = el.scrollLeft;
    const targetScroll = Math.max(0, currentScroll - slideWidth);

    el.scrollTo({
      left: targetScroll,
      behavior: "smooth",
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
      behavior: "smooth",
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "visible",
        maxWidth: "100vw",
        position: "relative",
      }}
    >
      {/* Navigation Buttons - Only show if there are multiple items */}
      {items.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
            pointerEvents: "none",
          }}
        >
          {/* Previous Button - Show on the left when not at first card */}
          <Box sx={{ flex: "0 0 auto" }}>
            {currentIndex > 0 && (
              <IconButton
                onClick={handlePrevious}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "primary.main",
                  width: 40,
                  height: 40,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  },
                  pointerEvents: "auto",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            )}
          </Box>

          {/* Next Button - Show on the right when not at last card */}
          <Box sx={{ flex: "0 0 auto" }}>
            {currentIndex < items.length - 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "primary.main",
                  width: 40,
                  height: 40,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  },
                  pointerEvents: "auto",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      <Box
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        sx={{
          display: "flex",
          gap: 0,
          px: 0,
          py: 2,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maxWidth: "100%",
          "&::-webkit-scrollbar": {
            display: "none",
            width: 0,
            height: 0,
          },
          "&::-webkit-scrollbar-track": {
            display: "none",
          },
          "&::-webkit-scrollbar-thumb": {
            display: "none",
          },
        }}
      >
        {items.map((item, index) => (
          <Box
            key={item.id || index}
            sx={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              minWidth: 0,
              py: 2,
              px: 2,
              width: "100%",
            }}
          >
            {renderItem(item, index)}
          </Box>
        ))}
      </Box>

      {/* Dots */}
      <Box
        sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}
        aria-hidden
      >
        {items.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === currentIndex ? "primary.main" : "grey.400",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MobileSlider;

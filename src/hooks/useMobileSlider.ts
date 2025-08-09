import { useEffect, useRef, useState, useCallback } from 'react';

interface UseMobileSliderProps {
  itemsCount: number;
  autoScrollInterval?: number;
  slideWidthRatio?: number;
  enableAutoScroll?: boolean;
}

interface UseMobileSliderReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeIndex: number;
  isAutoPlaying: boolean;
  stopAutoPlay: () => void;
  startAutoPlay: () => void;
}

export const useMobileSlider = ({
  itemsCount,
  autoScrollInterval = 3000,
  slideWidthRatio = 0.88,
  enableAutoScroll = false,
}: UseMobileSliderProps): UseMobileSliderReturn => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoplayRef = useRef<number | null>(null);
  
  // Use refs to store functions to avoid circular dependencies
  const stopAutoPlayRef = useRef<(() => void) | null>(null);
  const startAutoPlayRef = useRef<(() => void) | null>(null);

  // Initialize functions using useEffect to avoid circular dependencies
  useEffect(() => {
    // Initialize the stopAutoPlay function
    stopAutoPlayRef.current = () => {
      if (autoplayRef.current !== null) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
        setIsAutoPlaying(false);
      }
    };

    // Initialize the startAutoPlay function
    startAutoPlayRef.current = () => {
      if (!enableAutoScroll) return;
      
      // Call the current stopAutoPlay function
      if (stopAutoPlayRef.current) {
        stopAutoPlayRef.current();
      }
      
      autoplayRef.current = window.setInterval(() => {
        const el = containerRef.current;
        if (!el) return;
        
        const slideW = el.clientWidth * slideWidthRatio;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const nextLeft = el.scrollLeft + slideW;
        
        if (nextLeft >= maxScroll - 4) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: slideW, behavior: 'smooth' });
        }
      }, autoScrollInterval);
      setIsAutoPlaying(true);
    };
  }, [enableAutoScroll, slideWidthRatio, autoScrollInterval]);

  // Create stable references for the returned functions
  const stopAutoPlay = useCallback(() => {
    if (stopAutoPlayRef.current) {
      stopAutoPlayRef.current();
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (startAutoPlayRef.current) {
      startAutoPlayRef.current();
    }
  }, []);

  // Handle visibility change
  useEffect(() => {
    if (!enableAutoScroll) return;
    
    const handleVisibility = () => {
      if (document.hidden) {
        if (stopAutoPlayRef.current) {
          stopAutoPlayRef.current();
        }
      } else {
        if (startAutoPlayRef.current) {
          startAutoPlayRef.current();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enableAutoScroll]);

  // Handle pointer events for pause/resume
  useEffect(() => {
    if (!enableAutoScroll) return;
    
    const el = containerRef.current;
    if (!el) return;

    const pause = () => {
      if (stopAutoPlayRef.current) {
        stopAutoPlayRef.current();
      }
    };
    const resume = () => {
      if (startAutoPlayRef.current) {
        startAutoPlayRef.current();
      }
    };

    el.addEventListener('pointerdown', pause);
    el.addEventListener('pointerup', resume);
    el.addEventListener('pointerleave', resume);

    return () => {
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('pointerup', resume);
      el.removeEventListener('pointerleave', resume);
    };
  }, [enableAutoScroll]);

  // Handle scroll to update active index
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const slideW = el.clientWidth * slideWidthRatio;
      const idx = Math.round(el.scrollLeft / slideW);
      setActiveIndex(Math.min(Math.max(idx, 0), itemsCount - 1));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [itemsCount, slideWidthRatio]);

  // Start auto-play on mount (only if enabled)
  useEffect(() => {
    if (enableAutoScroll && startAutoPlayRef.current) {
      startAutoPlayRef.current();
      return () => {
        if (stopAutoPlayRef.current) {
          stopAutoPlayRef.current();
        }
      };
    }
  }, [enableAutoScroll]);

  return {
    containerRef,
    activeIndex,
    isAutoPlaying,
    stopAutoPlay,
    startAutoPlay,
  };
};

"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
export interface MobileSliderProps {
  children: React.ReactNode[];
  className?: string;
}
export const MobileSlider = ({
  children,
  className = ""
}: MobileSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const totalSlides = children.length;
  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
    }
  };
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const goToNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      goToPrevious();
    } else if (info.offset.x < -threshold && currentIndex < totalSlides - 1) {
      goToNext();
    }
  };
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Touch event handlers for better mobile support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && currentIndex < totalSlides - 1) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrevious();
    }
  };
  return <div className={`relative ${className}`}>
      {/* Slider Container with proper padding to prevent cut-off */}
      <div ref={sliderRef} className="overflow-hidden pb-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <motion.div className="flex" animate={{
        x: `${-currentIndex * 100}%`
      }} transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }} drag="x" dragConstraints={{
        left: 0,
        right: 0
      }} dragElastic={0.1} onDragStart={handleDragStart} onDragEnd={handleDragEnd} style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}>
          {children.map((child, index) => <div key={index} className="w-full flex-shrink-0 flex justify-center px-4">
              <div className="w-full max-w-[320px]">
                {child}
              </div>
            </div>)}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button onClick={goToPrevious} disabled={currentIndex === 0} className={`absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:shadow-xl hover:border-gray-300'}`} aria-label="Previous slide" style={{
      minWidth: '44px',
      minHeight: '44px'
    }}>
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>

      <button onClick={goToNext} disabled={currentIndex === totalSlides - 1} className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${currentIndex === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:shadow-xl hover:border-gray-300'}`} aria-label="Next slide" style={{
      minWidth: '44px',
      minHeight: '44px'
    }}>
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      {/* Dots Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({
        length: totalSlides
      }).map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${index === currentIndex ? 'bg-blue-600 w-6 h-2' : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'}`} aria-label={`Go to slide ${index + 1}`} style={{
        minWidth: '16px',
        minHeight: '16px'
      }} />)}
      </div>
    </div>;
};
"use client";

import React from 'react';
import { motion } from 'framer-motion';
interface Quote {
  text: string;
  author: string;
}
interface AuthPageLayoutProps {
  children: React.ReactNode;
  quote: Quote;
  illustration: string;
}
export const AuthPageLayout = ({
  children,
  quote,
  illustration
}: AuthPageLayoutProps) => {
  return <div className="h-screen flex overflow-hidden">
      {/* Left Column - Form (52% width, min-width 640px) */}
      <div className="flex-none w-[52%] min-w-[640px] flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-[520px]">
          {children}
        </div>
      </div>

      {/* Right Column - Illustration & Quote (48% width) */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url(${illustration})`
      }} />
        {/* Blue Overlay (30-40% opacity) */}
        <div className="absolute inset-0 bg-blue-600/35" />
        
        {/* Quote Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="max-w-lg">
            {/* Decorative Element */}
            <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="w-20 h-1 bg-white/30 rounded-full mx-auto mb-8" />
            
            {/* Quote */}
            <motion.blockquote initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.6,
            duration: 0.8
          }} className="text-white">
              <p className="text-2xl font-medium leading-relaxed mb-6 text-white/95">
                "{quote.text}"
              </p>
              <footer className="text-blue-100 font-semibold text-lg">
                — {quote.author}
              </footer>
            </motion.blockquote>

            {/* Decorative Bottom Element */}
            <motion.div initial={{
            width: 0
          }} animate={{
            width: '100%'
          }} transition={{
            duration: 1,
            delay: 1
          }} className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8" />
          </motion.div>
        </div>
      </div>
    </div>;
};
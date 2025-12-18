import React from 'react';
import { motion } from 'framer-motion';

// @component: HeroSection
export const HeroSection = () => {
  // @return
  return <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.h1 initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="text-4xl md:text-6xl font-bold mb-6">
          <span>Hệ thống quản lý sức khỏe thận</span>
        </motion.h1>
        <motion.h2 initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="text-2xl md:text-3xl font-semibold mb-4">
          <span>Healthcare+</span>
        </motion.h2>
        <motion.p initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.4
      }} className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          <span>Chăm sóc sức khỏe toàn diện với công nghệ hiện đại và đội ngũ y tế chuyên nghiệp. Đặt lịch khám dễ dàng, theo dõi sức khỏe thông minh.</span>
        </motion.p>
        <motion.button initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.6
      }} className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
          <span>Đăng nhập</span>
        </motion.button>
      </div>
    </section>;
};
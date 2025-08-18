"use client";

import React from 'react';

interface WelcomeSectionProps {
  userName: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  const firstName = userName.split(' ').pop() || userName;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        Chào mừng trở lại, {firstName}!
      </h1>
      <p className="text-blue-100 mb-4">
        Hôm nay là ngày tốt để chăm sóc sức khỏe của bạn
      </p>
    </div>
  );
}

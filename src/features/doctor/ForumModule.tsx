'use client'

import React from 'react';
import { CommunityPage } from '@/features/patient/CommunityPage';
import { useAuthContext } from '@/contexts/AuthContext';

export function ForumModule() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  // Map user data to match CommunityPage props
  const mappedUser = {
    id: user.userId,
    name: user.name || user.fullName || 'Doctor',
    avatar: user.avatar || user.avatarUrl || '',
    email: user.email,
    role: user.role
  };

  return <CommunityPage user={mappedUser as any} />;
}
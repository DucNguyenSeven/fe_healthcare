"use client";

import React from 'react';
import { AIAssistantPage, User } from '@/features/patient';

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@email.com',
  phone: '0123456789',
  avatar: '/api/placeholder/40/40',
  ckdStage: 3,
  lastEgfr: 45,
  lastCreatinine: 1.8,
  lastBp: '140/90'
};

export default function AIAssistantPageRoute() {
  return <AIAssistantPage user={mockUser} />;
}

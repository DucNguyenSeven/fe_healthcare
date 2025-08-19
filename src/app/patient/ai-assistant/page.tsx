"use client";

import React from 'react';
import { AIAssistantPage, User } from '@/features/patient';
import { mockUser } from '@/data/global/patient.data';

// Using centralized mock user

export default function AIAssistantPageRoute() {
  return <AIAssistantPage user={mockUser} />;
}

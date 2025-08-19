"use client";

import React from 'react';
import { CommunityPage, User } from '@/features/patient';
import { mockUser } from '@/data/global/patient.data';

// Using centralized mock user

export default function CommunityPageRoute() {
  return <CommunityPage user={mockUser} />;
}

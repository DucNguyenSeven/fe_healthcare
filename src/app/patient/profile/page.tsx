"use client";

import React from 'react';
import { ProfileRecordsPage, User } from '@/features/patient';
import { mockUser } from '@/data/global/patient.data';

// Using centralized mock user

export default function ProfileRecordsPageRoute() {
  return <ProfileRecordsPage user={mockUser} />;
}

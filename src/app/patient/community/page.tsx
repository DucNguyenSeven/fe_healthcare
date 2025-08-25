"use client";

import React from 'react';
import { CommunityPage } from '@/features/patient';
import { usePatient } from '@/hooks/usePatient';

// Using centralized mock user

export default function CommunityPageRoute() {
  const { user } = usePatient();
  return <CommunityPage user={user} />;
}

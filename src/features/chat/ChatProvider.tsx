'use client'

import React from 'react'
import { ChatWidget } from './ChatWidget'
import { useAuthContext } from '@/contexts/AuthContext'

export function ChatProvider() {
  const { isAuthenticated, user } = useAuthContext()

  // Only show chat widget for authenticated users who are doctors or patients
  if (!isAuthenticated || !user) {
    return null
  }

  // Only show for doctor and patient roles
  if (user.role !== 'DOCTOR' && user.role !== 'PATIENT') {
    return null
  }

  return <ChatWidget />
}
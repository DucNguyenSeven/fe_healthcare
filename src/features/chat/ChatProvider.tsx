'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ChatWidget } from './ChatWidget'
import { useAuthContext } from '@/contexts/AuthContext'
import { WebSocketChatProvider } from '@/contexts/WebSocketChatContext'

export function ChatProvider() {
  const { isAuthenticated, user } = useAuthContext()
  const pathname = usePathname()

  // Don't show chat widget on auth pages
  const isAuthRoute = pathname?.startsWith('/auth') || pathname === '/'

  // Only show chat widget for authenticated users who are doctors or patients
  if (!isAuthenticated || !user || isAuthRoute) {
    return null
  }

  // Only show for doctor and patient roles
  if (user.role !== 'DOCTOR' && user.role !== 'PATIENT') {
    return null
  }

  return (
    <WebSocketChatProvider>
      <ChatWidget />
    </WebSocketChatProvider>
  )
}
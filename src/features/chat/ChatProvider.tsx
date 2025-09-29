'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ChatWidget } from './ChatWidget'
import { useAuthContext } from '@/contexts/AuthContext'
import { WebSocketChatProvider } from '@/contexts/WebSocketChatContext'

interface ChatProviderProps {
  children?: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { isAuthenticated, user } = useAuthContext()
  const pathname = usePathname()

  // Don't show chat widget on auth pages
  const isAuthRoute = pathname?.startsWith('/auth') || pathname === '/'

  // Always wrap children with WebSocketChatProvider for authenticated users
  if (!isAuthenticated || !user) {
    return children || null
  }

  // Only show chat widget for doctor and patient roles, but still provide context
  const shouldShowChatWidget = (user.role === 'DOCTOR' || user.role === 'PATIENT') && !isAuthRoute

  return (
    <WebSocketChatProvider>
      {children}
      {shouldShowChatWidget && <ChatWidget />}
    </WebSocketChatProvider>
  )
}
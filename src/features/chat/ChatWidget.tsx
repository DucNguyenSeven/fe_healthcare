'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2 } from 'lucide-react'
import { ChatButton } from './components/ChatButton'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { ChatWidgetView, ChatConversation, ChatUser } from './types'
import { getConversationsByRole } from '@/data/mock/chat-data'
import { useAuthContext } from '@/contexts/AuthContext'

export function ChatWidget() {
  const [view, setView] = useState<ChatWidgetView>('collapsed')
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuthContext()

  // Mock current user based on auth context
  const currentUser: ChatUser = {
    id: user?.userId || 'current-user',
    name: user?.fullName || 'User',
    avatar: user?.avatarUrl || '/api/placeholder/40/40',
    role: user?.role === 'DOCTOR' ? 'doctor' : 'patient',
    isOnline: true
  }

  // Load conversations based on user role
  useEffect(() => {
    const userConversations = getConversationsByRole(currentUser.role)
    setConversations(userConversations)
  }, [currentUser.role])

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  // Get active conversation
  const activeConversation = conversations.find(conv => conv.id === activeConversationId)

  const handleToggleWidget = () => {
    if (view === 'collapsed') {
      setView('conversations')
    } else {
      setView('collapsed')
      setActiveConversationId(null)
      setIsExpanded(false) // Reset expand state when closing
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId)
    setView('chat')

    // Mark conversation as read (in real app, this would be an API call)
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    )
  }

  const handleBackToConversations = () => {
    setActiveConversationId(null)
    setView('conversations')
  }

  const handleSendMessage = (content: string) => {
    // In a real app, this would send the message via API
    console.log('Sending message:', content)

    // Mock: Add message to conversation (simplified)
    if (activeConversationId) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        isRead: false
      }

      // Update last message in conversation
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                lastMessage: newMessage,
                updatedAt: newMessage.timestamp
              }
            : conv
        )
      )
    }
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Chat Button */}
      <ChatButton
        unreadCount={totalUnreadCount}
        onClick={handleToggleWidget}
        isOpen={view !== 'collapsed'}
      />

      {/* Chat Widget Window */}
      <AnimatePresence>
        {view !== 'collapsed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={`
              fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9998] overflow-hidden transition-all duration-300
              ${isExpanded
                ? 'bottom-4 right-4 left-4 top-4 md:bottom-20 md:right-4 md:left-auto md:top-auto md:w-96 md:h-[500px]'
                : 'bottom-20 right-4 w-80 h-96'
              }
            `}
          >
            {/* Header controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1">
              {/* Expand button */}
              <button
                onClick={handleToggleExpand}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>

              {/* Close button */}
              <button
                onClick={handleToggleWidget}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content based on current view */}
            {view === 'conversations' && (
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onConversationSelect={handleConversationSelect}
                userRole={currentUser.role}
              />
            )}

            {view === 'chat' && activeConversation && (
              <ChatWindow
                conversation={activeConversation}
                currentUser={currentUser}
                onBack={handleBackToConversations}
                onSendMessage={handleSendMessage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {view !== 'collapsed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleToggleWidget}
            className="fixed inset-0 bg-black bg-opacity-20 z-[9997] md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}
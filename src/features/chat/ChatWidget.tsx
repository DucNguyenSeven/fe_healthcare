'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, AlertCircle } from 'lucide-react'
import { ChatButton } from './components/ChatButton'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { ChatWidgetView, ChatUser } from './types'
import { useAuthContext } from '@/contexts/AuthContext'
import { useWebSocketChat } from '@/contexts/WebSocketChatContext'

export function ChatWidget() {
  const [view, setView] = useState<ChatWidgetView>('collapsed')
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuthContext()

  const {
    conversations,
    activeConversationId,
    connectionStatus,
    isLoading,
    error,
    setActiveConversation,
    joinConversation,
    sendChatMessage,
    markAsRead,
    reconnect,
    clearError
  } = useWebSocketChat()

  // Current user based on auth context
  const currentUser: ChatUser = {
    id: user?.userId || 'current-user',
    name: user?.fullName || 'User',
    avatar: user?.avatarUrl || '/api/placeholder/40/40',
    role: user?.role === 'DOCTOR' ? 'doctor' : 'patient',
    isOnline: true
  }

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  // Get active conversation
  const activeConversation = conversations.find(conv => conv.id === activeConversationId)

  const handleToggleWidget = () => {
    if (view === 'collapsed') {
      setView('conversations')
      // Clear error when opening widget
      if (error) clearError()
    } else {
      setView('collapsed')
      setActiveConversation(null)
      setIsExpanded(false) // Reset expand state when closing
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    try {
      setView('chat')
      await joinConversation(conversationId)
      markAsRead(conversationId)
    } catch (error) {
      console.error('Failed to join conversation:', error)
    }
  }

  const handleBackToConversations = () => {
    setActiveConversation(null)
    setView('conversations')
  }

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return

    try {
      await sendChatMessage(activeConversationId, content)
    } catch (error) {
      // Silent error handling
    }
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleRetryConnection = async () => {
    try {
      await reconnect()
    } catch (error) {
      // Silent error handling
    }
  }

  // Auto-open widget when a new conversation is set
  useEffect(() => {
    if (activeConversationId && view === 'collapsed') {
      setView('chat')
      // Auto-join the conversation
      joinConversation(activeConversationId)
    }
  }, [activeConversationId, view, joinConversation])

  return (
    <>
      {/* Chat Button */}
      <ChatButton
        unreadCount={totalUnreadCount}
        onClick={handleToggleWidget}
        isOpen={view !== 'collapsed'}
        isExpanded={isExpanded}
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
                ? 'inset-4'
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

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {connectionStatus === 'error' && (
                      <button
                        onClick={handleRetryConnection}
                        className="text-xs text-red-600 hover:text-red-700 underline"
                      >
                        Thử lại
                      </button>
                    )}
                    <button
                      onClick={clearError}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600 font-medium">Đang tạo cuộc trò chuyện...</span>
                  <span className="text-xs text-gray-500 text-center max-w-48">
                    Vui lòng chờ trong giây lát
                  </span>
                </div>
              </div>
            )}

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
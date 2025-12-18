'use client'

import React from 'react'
import { ChatConversation } from './types'
import { UserAvatar } from './components/UserAvatar'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ConversationItemProps {
  conversation: ChatConversation
  isActive?: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive = false, onClick }: ConversationItemProps) {
  const otherParticipant = conversation.participants[0]
  const lastMessage = conversation.lastMessage

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi
      })
    } catch {
      return 'Vừa xong'
    }
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 flex items-center space-x-3 text-left transition-colors rounded-xl
        ${isActive
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50'
        }
      `}
    >
      {/* Avatar */}
      <UserAvatar user={otherParticipant} size="md" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
            {otherParticipant.name}
          </h4>
          {lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            {lastMessage ? truncateMessage(lastMessage.content) : 'Chưa có tin nhắn'}
          </p>

          {/* Unread count badge */}
          {conversation.unreadCount > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Typing indicator */}
        {conversation.isTyping && (
          <div className="flex items-center mt-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-blue-600 ml-2">đang soạn tin...</span>
          </div>
        )}
      </div>
    </button>
  )
}
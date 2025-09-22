'use client'

import React from 'react'
import { ChatMessage, ChatUser } from './types'
import { UserAvatar } from './components/UserAvatar'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Check, CheckCheck } from 'lucide-react'

interface MessageItemProps {
  message: ChatMessage
  sender: ChatUser
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}

export function MessageItem({
  message,
  sender,
  isOwn,
  showAvatar = true,
  showTimestamp = true
}: MessageItemProps) {
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

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <UserAvatar user={sender} size="sm" showOnlineStatus={false} />
        )}

        {/* Message bubble */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name (only for incoming messages) */}
          {!isOwn && showAvatar && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {sender.name}
            </span>
          )}

          {/* Message content */}
          <div
            className={`
              px-4 py-2 rounded-2xl
              ${isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }
            `}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Message metadata */}
            <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
              {showTimestamp && (
                <span className="text-xs">
                  {formatTime(message.timestamp)}
                </span>
              )}

              {/* Read status for own messages */}
              {isOwn && (
                <div className="ml-1">
                  {message.isRead ? (
                    <CheckCheck className="w-3 h-3" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
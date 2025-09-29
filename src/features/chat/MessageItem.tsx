'use client'

import React from 'react'
import { ChatMessage, ChatUser } from './types'
import { UserAvatar } from './components/UserAvatar'
import { format } from 'date-fns'

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
      return format(new Date(timestamp), 'HH:mm')
    } catch {
      return '--:--'
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mb-4' : 'mb-1'}`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar or placeholder */}
        {!isOwn && (
          showAvatar ? (
            <UserAvatar user={sender} size="sm" showOnlineStatus={false} />
          ) : (
            <div className="w-8 h-8" />
          )
        )}

        {/* Message bubble */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%]`}>
          {/* Sender name (only for incoming messages) */}
          {!isOwn && showAvatar && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {sender.name}
            </span>
          )}

          {/* Message content */}
          <div
            className={`
              px-4 py-2 rounded-2xl inline-block
              ${isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }
            `}
          >
            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </span>

              {/* Message metadata */}
              {showTimestamp && (
                <span className={`text-xs flex-shrink-0 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
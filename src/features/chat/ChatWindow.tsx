'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { ChatConversation, ChatUser } from './types'
import { ChatHeader } from './components/ChatHeader'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { useWebSocketChat } from '@/contexts/WebSocketChatContext'

interface ChatWindowProps {
  conversation: ChatConversation
  currentUser: ChatUser
  onBack: () => void
  onSendMessage: (content: string) => void
}

export function ChatWindow({
  conversation,
  currentUser,
  onBack,
  onSendMessage
}: ChatWindowProps) {
  const otherParticipant = conversation.participants[0]

  const {
    messages: allMessages,
    isLoading,
    connectionStatus
  } = useWebSocketChat()

  // Get messages for this conversation (reversed: newest first)
  const messages = useMemo(() => {
    const msgs = allMessages[conversation.id] || []
    return [...msgs].reverse()
  }, [allMessages, conversation.id])

  const handleSendMessage = (content: string) => {
    onSendMessage(content)
    // In a real app, this would add the message to the conversation
    // For now, we'll just call the callback
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader
        user={otherParticipant}
        onBack={onBack}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2">
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUser.id
              const sender = isOwn ? currentUser : otherParticipant
              const nextMessage = messages[index + 1]
              const showAvatar = !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId)

              // Generate stable key - fallback to index if id is missing
              const key = message.id || `msg-${index}-${message.timestamp}`

              return (
                <MessageItem
                  key={key}
                  message={message}
                  sender={sender}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTimestamp={true}
                />
              )
            })}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                Hãy bắt đầu cuộc trò chuyện!
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                Gửi tin nhắn đầu tiên cho <span className="font-medium">{otherParticipant.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                Bác sĩ sẽ nhận được thông báo và phản hồi sớm nhất có thể
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        placeholder={`Nhắn tin cho ${otherParticipant.name}...`}
        autoFocus={messages.length === 0}
        isConnected={connectionStatus === 'connected'}
      />
    </div>
  )
}
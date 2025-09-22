'use client'

import React, { useRef, useEffect } from 'react'
import { ChatConversation, ChatMessage, ChatUser } from './types'
import { ChatHeader } from './components/ChatHeader'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { getMessagesByConversationId } from '@/data/mock/chat-data'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const otherParticipant = conversation.participants[0]

  // Get messages for this conversation
  const messages = getMessagesByConversationId(conversation.id)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        isTyping={conversation.isTyping}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUser.id
              const sender = isOwn ? currentUser : otherParticipant
              const previousMessage = messages[index - 1]
              const showAvatar = !isOwn && (!previousMessage || previousMessage.senderId !== message.senderId)

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  sender={sender}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTimestamp={true}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Bắt đầu cuộc trò chuyện
              </h4>
              <p className="text-sm text-gray-600">
                Gửi tin nhắn đầu tiên cho {otherParticipant.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        placeholder={`Nhắn tin cho ${otherParticipant.name}...`}
      />
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { ChatConversation } from './types'
import { ConversationItem } from './ConversationItem'

interface ConversationListProps {
  conversations: ChatConversation[]
  activeConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  userRole: 'doctor' | 'patient'
}

export function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  userRole
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conversation => {
    // Filter out AI conversations (safety net)
    // Check if conversation ID ends with "-AI" or if any participant has userId "AI"
    const isAIConversation = conversation.id.endsWith('-AI') ||
      conversation.participants.some(p => p.id === 'AI')

    if (isAIConversation) return false

    if (!searchQuery) return true
    const otherParticipant = conversation.participants[0]
    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Tin nhắn</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Tìm ${userRole === 'doctor' ? 'bệnh nhân' : 'bác sĩ'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => onConversationSelect(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn'}
            </h4>
            <p className="text-sm text-gray-600">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : `Bắt đầu trò chuyện với ${userRole === 'doctor' ? 'bệnh nhân' : 'bác sĩ'}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer with summary */}
      {conversations.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{conversations.length} cuộc trò chuyện</span>
            {totalUnreadCount > 0 && (
              <span className="text-blue-600 font-medium">
                {totalUnreadCount} tin nhắn chưa đọc
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
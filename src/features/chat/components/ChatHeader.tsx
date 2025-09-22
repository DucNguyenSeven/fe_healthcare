'use client'

import React from 'react'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { ChatUser } from '../types'
import { UserAvatar } from './UserAvatar'

interface ChatHeaderProps {
  user: ChatUser
  onBack: () => void
  isTyping?: boolean
}

export function ChatHeader({ user, onBack, isTyping = false }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* User info */}
        <UserAvatar user={user} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {user.name}
          </h4>
          <p className="text-sm text-gray-500">
            {isTyping ? (
              <span className="text-blue-600">đang soạn tin...</span>
            ) : user.isOnline ? (
              'Đang hoạt động'
            ) : user.lastSeen ? (
              `Hoạt động ${new Date(user.lastSeen).toLocaleDateString('vi-VN')}`
            ) : (
              'Ngoại tuyến'
            )}
          </p>
          {user.specialty && (
            <p className="text-xs text-gray-400">
              {user.specialty}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
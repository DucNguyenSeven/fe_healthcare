'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { ChatUser } from '../types'
import { UserAvatar } from './UserAvatar'

interface ChatHeaderProps {
  user: ChatUser
  onBack: () => void
}

export function ChatHeader({ user, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* User info */}
        <UserAvatar user={user} size="md" showOnlineStatus={false} />
        <div className="flex-1 min-w-0 mr-16">
          <h4 className="font-medium text-gray-900 truncate">
            {user.name}
          </h4>
          {user.specialty && (
            <p className="text-xs text-gray-400 truncate">
              {user.specialty}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
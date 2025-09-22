'use client'

import React from 'react'
import { ChatUser } from '../types'

interface UserAvatarProps {
  user: ChatUser
  size?: 'sm' | 'md' | 'lg'
  showOnlineStatus?: boolean
}

export function UserAvatar({ user, size = 'md', showOnlineStatus = true }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const statusSizeClasses = {
    sm: 'w-2.5 h-2.5 border border-white',
    md: 'w-3 h-3 border-2 border-white',
    lg: 'w-3.5 h-3.5 border-2 border-white'
  }

  return (
    <div className="relative">
      <img
        src={user.avatar || '/api/placeholder/40/40'}
        alt={`Avatar của ${user.name}`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />

      {/* Online status indicator */}
      {showOnlineStatus && (
        <div
          className={`
            absolute bottom-0 right-0 rounded-full
            ${statusSizeClasses[size]}
            ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}
          `}
        />
      )}
    </div>
  )
}
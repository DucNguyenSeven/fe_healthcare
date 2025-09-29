'use client'

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  placeholder?: string
  autoFocus?: boolean
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Nhập tin nhắn...',
  autoFocus = false
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && textareaRef.current && !disabled) {
      // Small delay to ensure the component is mounted
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus, disabled])

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const maxHeight = 120 // Max 5 lines approximately
    textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-3">

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed scrollbar-hide"
            style={{
              minHeight: '40px',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          />

          
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
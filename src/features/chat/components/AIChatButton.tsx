'use client'

import React from 'react'
import { Bot } from 'lucide-react'
import { motion } from 'framer-motion'

interface AIChatButtonProps {
  onClick: () => void
  isOpen: boolean
  isExpanded?: boolean
}

export function AIChatButton({ onClick, isOpen, isExpanded = false }: AIChatButtonProps) {
  // Hide button when expanded to prevent blocking
  if (isExpanded) {
    return null
  }

  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center transition-all duration-200
        ${isOpen
          ? 'bg-purple-500 hover:bg-purple-600'
          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }
        z-[9999]
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      title="Trợ lý AI"
    >
      <Bot className="w-6 h-6 text-white" />
    </motion.button>
  )
}

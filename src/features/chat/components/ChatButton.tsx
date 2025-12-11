"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ChatButtonProps {
  unreadCount: number;
  onClick: () => void;
  isOpen: boolean;
  isExpanded?: boolean;
}

export function ChatButton({
  unreadCount,
  onClick,
  isOpen,
  isExpanded = false,
}: ChatButtonProps) {
  // Hide button when expanded to prevent blocking send button
  if (isExpanded) {
    return null;
  }

  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed bottom-6 right-4 w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center transition-all duration-200
        ${
          isOpen
            ? "bg-gray-500 hover:bg-gray-600"
            : "bg-blue-600 hover:bg-blue-700"
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
        damping: 20,
      }}
    >
      <MessageCircle className="w-6 h-6 text-white" />

      {/* Unread count badge */}
      {unreadCount > 0 && !isOpen && (
        <motion.div
          className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-white text-xs font-medium px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </motion.div>
      )}
    </motion.button>
  );
}

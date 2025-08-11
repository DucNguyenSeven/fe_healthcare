import React, { useEffect, useRef } from 'react';
import { Box, Stack } from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '../../../../hooks/useChat';

export { MessageBubble } from './MessageBubble';
export { EmptyState } from './EmptyState';
export { MarkdownRenderer } from './MarkdownRenderer';
export { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or typing indicator appears
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length, loading]);

  // Show empty state only when no messages and not loading
  if (messages.length === 0 && !loading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState />
      </Box>
    );
  }

  return (
    <Stack 
      spacing={2} 
      sx={{
        flex: 1,
        overflowY: 'auto', 
        px: { xs: 1, sm: 2 }, 
        py: { xs: 2, sm: 3 },
        pb: { xs: 1, sm: 2 }, 
        height: '100%',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0,0,0,0.3)',
        },
      }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* Show typing indicator when AI is responding */}
      {loading && <TypingIndicator />}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </Stack>
  );
}; 
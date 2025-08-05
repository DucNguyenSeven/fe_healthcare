import React from 'react';
import { Box, Stack } from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { ChatMessage } from '../../../../hooks/useChat';

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
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
        pb: { xs: 1, sm: 2 }, // Extra bottom padding for mobile
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
    </Stack>
  );
}; 
import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { ChatMessage } from '../../../../hooks/useChat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: { xs: 1, sm: 2 }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row' : 'row',
          alignItems: 'flex-start',
          gap: !isUser ? 1 : 0,
          maxWidth: '75%'
        }}
      >
        {/* Only show avatar for AI messages */}
        {!isUser && (
          <Avatar
            sx={{
              bgcolor: '#374151',
              color: 'white',
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            AI
          </Avatar>
        )}
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            flex: 1
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: isUser ? '320px' : '100%',
              px: 2,
              py: 1.5,
              borderRadius: 3,
              bgcolor: isUser ? '#2563EB' : 'white',
              color: isUser ? 'white' : '#374151',
              border: !isUser ? '1px solid #E5E7EB' : 'none',
              boxShadow: !isUser ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
            }}
          >
            <MarkdownRenderer 
              content={message.content}
              isUser={isUser}
            />
          </Paper>
          
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              opacity: 0.6,
              fontSize: '0.75rem',
              color: '#6B7280',
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              px: 0.5
            }}
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

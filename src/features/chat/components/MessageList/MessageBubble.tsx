import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: Date;
}

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
        mb: 1.5,
        px: 1.5
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 0.75,
          maxWidth: '75%'
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'grey.300',
            color: isUser ? 'white' : 'grey.700',
            width: 28,
            height: 28,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          {isUser ? 'U' : 'AI'}
        </Avatar>
        
        <Box
          sx={{
            bgcolor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 8,
              [isUser ? 'right' : 'left']: -6,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '6px 6px 6px 0',
              borderColor: isUser 
                ? 'transparent transparent transparent primary.main'
                : 'transparent grey.100 transparent transparent',
              transform: isUser ? 'rotate(0deg)' : 'rotate(180deg)'
            }
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.content}
          </Typography>
          
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.75rem'
            }}
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextareaAutosize, 
  IconButton, 
  CircularProgress,
  Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  onAttach?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  isLoading = false, 
  disabled = false,
  onAttach
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Paper
        sx={{
          p: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: { xs: 44, sm: 48 },
          borderRadius: { xs: 22, sm: 24 },
          boxShadow: 2
        }}
      >
        <IconButton
          onClick={onAttach}
          disabled={disabled || isLoading}
          color="primary"
          size="small"
          sx={{
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
            borderRadius: '50%'
          }}
          aria-label="Đính kèm tệp"
        >
          <AttachFileIcon fontSize="small" />
        </IconButton>
        
        <TextareaAutosize
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn của bạn... "
          disabled={disabled || isLoading}
          style={{
            flex: 1,
            minHeight: 28,
            maxHeight: 120,
            padding: '6px 12px',
            border: 'none',
            borderRadius: '22px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: disabled ? '#999' : '#333'
          }}
        />
        
        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          color="primary"
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            borderRadius: '50%'
          }}
          aria-label="Gửi tin nhắn"
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Paper>
    </Box>
  );
}; 
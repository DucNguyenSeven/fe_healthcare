'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextareaAutosize, 
  IconButton, 
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';

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
        p: { xs: 2, md: 3 },
        bgcolor: 'white'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1.5,
          p: 1,
          borderRadius: 8,
          bgcolor: '#F3F4F6',
          border: 'none',
          minHeight: 52
        }}
      >
        <IconButton
          onClick={onAttach}
          disabled={disabled || isLoading}
          size="small"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid #93C5FD',
            bgcolor: 'white',
            color: '#3B82F6',
            '&:hover': {
              bgcolor: '#F8FAFC',
              borderColor: '#60A5FA'
            },
            '&:disabled': {
              bgcolor: '#F8FAFC',
              color: '#9CA3AF',
              borderColor: '#D1D5DB'
            }
          }}
          aria-label="Đính kèm tệp"
        >
          <AddIcon fontSize="small" />
        </IconButton>
        
        <TextareaAutosize
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn của bạn..."
          disabled={disabled || isLoading}
          style={{
            flex: 1,
            minHeight: 20,
            maxHeight: 120,
            padding: '8px 12px',
            border: 'none',
            borderRadius: '0',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: disabled ? '#999' : '#333',
            lineHeight: '1.4'
          }}
        />
        
        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#1D4ED8',
            color: 'white',
            '&:hover': {
              bgcolor: '#1E40AF'
            },
            '&:disabled': {
              bgcolor: '#9CA3AF',
              color: '#F3F4F6'
            }
          }}
          aria-label="Gửi tin nhắn"
        >
          {isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SendIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}; 
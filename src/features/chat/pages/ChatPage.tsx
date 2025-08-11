'use client';

import React from 'react';
import { Box } from '@mui/material';
import { ChatLayout } from '../components/ChatLayout';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { SuggestionChips } from '../components/SuggestionChips';
import { useChat } from '../../../hooks/useChat';

export default function ChatPage() {
  const { messages, loading, sendQuestion } = useChat();

  return (
    <ChatLayout
      header={<ChatHeader loading={loading} />}
      content={
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {messages.length === 0 && !loading ? (
              <>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageList messages={messages} loading={loading} />
                </Box>
                <SuggestionChips
                  onSelect={sendQuestion}
                  visible={true}
                />
              </>
            ) : (
              <MessageList messages={messages} loading={loading} />
            )}
          </Box>
          <ChatInput onSend={sendQuestion} isLoading={loading} />
        </Box>
      }
    />
  );
} 
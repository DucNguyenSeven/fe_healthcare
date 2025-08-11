"use client";

import React from "react";
import {
  Box,
  Drawer
} from "@mui/material";
import { NewConversationBtn } from "./Sidebar/NewConversationBtn";
import { ConversationList } from "./Sidebar/ConversationList";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { SuggestionChips } from "./SuggestionChips";
import { ChatInput } from "./ChatInput";
import { useChat } from "../../../hooks/useChat";
import { useConversations } from "../../../hooks/useConversations";
import { useNavigation } from "../../../hooks/useNavigation";

// Interfaces
interface ChatLayoutProps {
  header?: React.ReactNode;
  content?: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ header, content }) => {
  // Custom hooks for separated concerns
  const { messages, loading, sendQuestion, clearMessages } = useChat();
  const { 
    conversations, 
    currentConversationId, 
    createNewConversation, 
    selectConversation 
  } = useConversations();
  const { 
    isMobile, 
    drawerOpen, 
    openDrawer, 
    closeDrawer, 
    handleMobileAction 
  } = useNavigation();

  const handleSuggestionSelect = async (text: string) => {
    await sendQuestion(text);
  };

  const handleNewConversation = async () => {
    createNewConversation();
    clearMessages();
    handleMobileAction();
  };

  const handleConversationSelect = (id: string) => {
    selectConversation(id);
    clearMessages(); 
    handleMobileAction();
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    await sendQuestion(content.trim());
  };

  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: 'white' }}>
      <NewConversationBtn onClick={handleNewConversation} />
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <ConversationList
          conversations={conversations}
          currentId={currentConversationId}
          onSelect={handleConversationSelect}
        />
      </Box>
    </Box>
  );



  const mainContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 0,
      position: 'relative'
    }}>
      {content || (
        <>
          <Box sx={{ 
            flex: 1, 
            bgcolor: 'grey.50', 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0, 
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{ 
              flex: 1, 
              overflow: 'hidden',
              position: 'relative'
            }}>
              <MessageList messages={messages} loading={loading} />
            </Box>
          </Box>
          
          {/* SuggestionChips above ChatInput - only show when no messages and not loading */}
          {messages.length === 0 && !loading && (
            <SuggestionChips
              onSelect={handleSuggestionSelect}
              visible={true}
            />
          )}
          
          <Box sx={{ 
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
            bgcolor: 'background.paper'
          }}>
            <ChatInput
              onSend={handleSendMessage}
              isLoading={loading}
              disabled={!currentConversationId}
              onAttach={() => {
                // TODO: Implement file attachment functionality
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Box sx={{ 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Topbar full-width */}
        {header || <ChatHeader onBack={openDrawer} />}
        
        {/* Main content below topbar */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative'
        }}>
          {mainContent}
        </Box>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={closeDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Topbar full-width */}
      {header || <ChatHeader />}
      
      {/* Below topbar: sidebar + main content */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        minHeight: 0
      }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: 0, md: 280 },
            borderRight: { md: 1 },
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
            flexShrink: 0,
            bgcolor: 'white'
          }}
        >
          {sidebarContent}
        </Box>

        {/* Main content */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {mainContent}
        </Box>
      </Box>
    </Box>
  );
};

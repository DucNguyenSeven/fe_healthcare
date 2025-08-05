"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NewConversationBtn } from "./Sidebar/NewConversationBtn";
import { ConversationList } from "./Sidebar/ConversationList";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { EmptyState } from "./MessageList/EmptyState";
import { SuggestionChips } from "./SuggestionChips";
import { ChatInput } from "./ChatInput";

// Interfaces
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "ai";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
}

// // Mock data
// const mockConversations: Conversation[] = [
//   {
//     id: "1",
//     title: "Lên lịch hẹn",
//     lastMessage: "Làm thế nào để tôi đặt lịch hẹn?",
//     updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
//   },
//   {
//     id: "2",
//     title: "Triệu chứng sức khỏe",
//     lastMessage: "Các triệu chứng cúm phổ biến là gì?",
//     updatedAt: new Date(Date.now() - 7200000), // 2 hours ago
//   },
// ];

interface ChatLayoutProps {
  header?: React.ReactNode;
  content?: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ header, content }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] =
    useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >("1");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestionSelect = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Đây là phản hồi AI mẫu cho: "${text}"

## Các bước thực hiện:

1. **Bước đầu tiên** - Xác định vấn đề
2. **Bước thứ hai** - Phân tích nguyên nhân
3. **Bước thứ ba** - Đưa ra giải pháp

### Lưu ý quan trọng:
- Đảm bảo tuân thủ quy trình
- Ghi chép đầy đủ thông tin
- Theo dõi tiến độ

> **Tip**: Luôn kiểm tra kỹ lưỡng trước khi thực hiện bất kỳ thay đổi nào.

\`\`\`javascript
// Ví dụ code
function handleAction() {
  console.log('Action executed');
}
\`\`\``,
        role: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleNewConversation = async () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Cuộc trò chuyện mới",
      updatedAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages([]);

    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleConversationSelect = (id: string) => {
    setCurrentConversationId(id);
    setMessages([]); // Clear messages when switching conversations
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Đây là phản hồi AI mẫu cho: "${content}"

## Các bước thực hiện:

1. **Bước đầu tiên** - Xác định vấn đề
2. **Bước thứ hai** - Phân tích nguyên nhân
3. **Bước thứ ba** - Đưa ra giải pháp

### Lưu ý quan trọng:
- Đảm bảo tuân thủ quy trình
- Ghi chép đầy đủ thông tin
- Theo dõi tiến độ

> **Tip**: Luôn kiểm tra kỹ lưỡng trước khi thực hiện bất kỳ thay đổi nào.

\`\`\`javascript
// Ví dụ code
function handleAction() {
  console.log('Action executed');
}
\`\`\``,
        role: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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

  const handleBack = () => {
    if (isMobile) {
      setDrawerOpen(true);
    }
  };

  const chatContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 0,
      position: 'relative'
    }}>
      {header || <ChatHeader onBack={handleBack} />}
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
            {messages.length === 0 ? (
              <>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyState />
                </Box>
                <SuggestionChips
                  onSelect={handleSuggestionSelect}
                  visible={true}
                />
              </>
            ) : (
              <Box sx={{ 
                flex: 1, 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <MessageList messages={messages} />
              </Box>
            )}
          </Box>
          <Box sx={{ 
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
            bgcolor: 'background.paper'
          }}>
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              disabled={!currentConversationId}
              onAttach={() => {
                // TODO: Implement attachment functionality
                console.log('Attach file clicked');
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
        <Box sx={{ 
          position: 'relative', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1200,
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <MenuIcon />
          </IconButton>

          {chatContent}
        </Box>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
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
      <Box sx={{ 
        display: 'flex', 
        height: '100%', 
        width: '100%',
        minHeight: 0
      }}>
        <Box
          sx={{
            width: { xs: 0, md: 200, lg: 220 },
            borderRight: { md: 1 },
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
            flexShrink: 0,
          }}
        >
          {sidebarContent}
        </Box>

        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {chatContent}
        </Box>
      </Box>
    </Box>
  );
};

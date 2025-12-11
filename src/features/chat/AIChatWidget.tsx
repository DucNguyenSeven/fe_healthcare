"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Bot, AlertCircle } from "lucide-react";
import { AIChatButton } from "./components/AIChatButton";
import { MessageInput } from "./MessageInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWebSocketChat } from "@/contexts/WebSocketChatContext";
import { ChatUser, ChatMessage } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AIChatWidgetView = "collapsed" | "chat";

export function AIChatWidget() {
  // State
  const [view, setView] = useState<AIChatWidgetView>("collapsed");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contexts
  const { user } = useAuthContext();
  const {
    messages: allMessages,
    currentAIGroupId,
    isAIResponding,
    sendAIMessage,
    connectionStatus,
    error,
    activeWidget,
    clearError,
    setActiveWidget,
    setAIWidgetExpanded,
  } = useWebSocketChat();

  // Messages với welcome message mặc định
  const messages = useMemo(() => {
    if (
      !currentAIGroupId ||
      !allMessages[currentAIGroupId] ||
      allMessages[currentAIGroupId].length === 0
    ) {
      return [
        {
          id: "welcome",
          conversationId: "ai-welcome",
          senderId: "AI",
          content:
            "Xin chào! Tôi là trợ lý AI của HealthCare+. Tôi có thể giúp bạn hiểu về bệnh thận mạn, giải thích các chỉ số xét nghiệm, và đưa ra lời khuyên về chế độ sinh hoạt. Bạn có câu hỏi gì không?",
          timestamp: new Date().toISOString(),
          type: "text" as const,
          isRead: true,
        },
      ];
    }
    // Sort messages by timestamp to ensure correct chronological order
    const sortedMessages = [...allMessages[currentAIGroupId]].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB; // Oldest first
    });
    return sortedMessages;
  }, [currentAIGroupId, allMessages]);

  // Handlers
  const handleToggleWidget = () => {
    if (view === "collapsed") {
      setView("chat");
      setActiveWidget("ai"); // Notify context that AI chat is opening
      if (error) clearError();
    } else {
      setView("collapsed");
      setActiveWidget("none"); // Notify context that widget is closing
      setIsExpanded(false);
      setAIWidgetExpanded(false); // Reset expand state
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    try {
      await sendAIMessage(content.trim());
    } catch (error) {
      console.error("Failed to send AI message:", error);
    }
  };

  const handleToggleExpand = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    setAIWidgetExpanded(newExpandState);
  };

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close AI chat when doctor chat opens
  useEffect(() => {
    if (activeWidget === "doctor" && view !== "collapsed") {
      setView("collapsed");
      setIsExpanded(false);
    }
  }, [activeWidget, view]);

  // // User objects
  // const aiUser: ChatUser = {
  //   id: 'AI',
  //   name: 'Trợ lý AI',
  //   avatar: '',
  //   role: 'patient',
  //   isOnline: true
  // }

  // const currentUser: ChatUser = {
  //   id: user?.userId || 'current-user',
  //   name: user?.fullName || 'User',
  //   avatar: user?.avatarUrl || '',
  //   role: user?.role === 'DOCTOR' ? 'doctor' : 'patient',
  //   isOnline: true
  // }

  // Render markdown cho AI messages
  const renderMessageContent = (message: ChatMessage) => {
    if (message.senderId === "AI") {
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-xl font-bold text-gray-900 mt-5 mb-2.5"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-lg font-bold text-gray-900 mt-4 mb-2.5"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-700 leading-relaxed mb-3" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc pl-5 space-y-1.5 mb-3 text-gray-700"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal pl-5 space-y-1.5 mb-3 text-gray-700"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-gray-900" {...props} />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code
                    className="px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono"
                    {...props}
                  />
                ) : (
                  <code
                    className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto my-2"
                    {...props}
                  />
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
    return (
      <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
      </span>
    );
  };

  return (
    <>
      {/* AI Chat Button */}
      <AIChatButton
        onClick={handleToggleWidget}
        isOpen={view !== "collapsed"}
        isExpanded={isExpanded}
      />

      {/* AI Chat Window */}
      <AnimatePresence>
        {view !== "collapsed" && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9998] overflow-hidden transition-all duration-300 flex flex-col
              ${isExpanded ? "inset-4" : "bottom-[6.5rem] right-4 w-80 h-96"}
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold text-sm">Trợ lý AI</h3>
                    <p className="text-xs text-purple-100">
                      {isAIResponding ? "Đang trả lời..." : "Sẵn sàng hỗ trợ"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleToggleExpand}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title={isExpanded ? "Thu gọn" : "Mở rộng"}
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleToggleWidget}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Đóng"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
              {/* Message List */}
              {messages.map((message, index) => {
                const isOwn = message.senderId !== "AI";

                return (
                  <div
                    key={message.id || `msg-${index}`}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
                  >
                    <div
                      className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end space-x-2 max-w-[85%]`}
                    >
                      {!isOwn && (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div
                        className={`
                        px-4 py-2 rounded-2xl
                        ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                        }
                      `}
                      >
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isAIResponding && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              placeholder="Hỏi trợ lý AI..."
              disabled={isAIResponding}
              isConnected={connectionStatus === "connected"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {view !== "collapsed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleToggleWidget}
            className="fixed inset-0 bg-black bg-opacity-20 z-[9997] md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

import { apiFetch } from "@/lib/api/client";
import type { ChatRequest, ChatResponse } from "@/lib/api/types";

export const ChatApi = {
  ask: (payload: ChatRequest) =>
    apiFetch<ChatResponse>("/api/chat/ask", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
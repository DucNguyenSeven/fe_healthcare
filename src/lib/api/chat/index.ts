import { api } from "@/lib/api/client";
import type { ChatRequest, ChatResponse } from "@/lib/api/types";

export const ChatApi = {
  ask: (payload: ChatRequest) =>
    api.post<ChatResponse>("/api/chat/ask", payload).then(res => res.data),
};
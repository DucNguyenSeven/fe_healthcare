import ChatPage from "../../features/chat/pages/ChatPage";
import { AuthGuard } from "../../components/common";

export default function ChatRoutePage() {
  return (
    <AuthGuard>
      <ChatPage />
    </AuthGuard>
  );
}

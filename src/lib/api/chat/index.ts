export async function postChat(question: string): Promise<{ answer: string }> {
  const base = process.env.NEXT_PUBLIC_CHAT_API_URL;
  const res = await fetch(`${base}/api/ai-chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
} 
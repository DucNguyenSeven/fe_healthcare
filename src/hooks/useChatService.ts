import { useState, useCallback } from 'react';
import { chat as chatApi, chatStream as chatStreamApi, health as chatHealth, ChatResponse } from '@/lib/api/chat';

export function useChatService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (message: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>, model?: string): Promise<ChatResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await chatApi({ message, history, model });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const askStream = useCallback(async (message: string, onChunk: (text: string) => void, history?: Array<{ role: 'user' | 'assistant'; content: string }>, model?: string) => {
    setLoading(true);
    setError(null);
    try {
      const stream = await chatStreamApi({ message, history, model });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        // Keep last partial chunk in buffer
        buffer = events.pop() || '';
        for (const evt of events) {
          if (evt.startsWith('data: ')) {
            try {
              const json = JSON.parse(evt.slice(6));
              if (json?.text) onChunk(json.text);
            } catch {
              // ignore malformed chunks
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const health = useCallback(async () => chatHealth(), []);

  return { loading, error, ask, askStream, health };
}



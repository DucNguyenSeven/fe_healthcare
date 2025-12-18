import { useState, useCallback } from 'react';
import { askRag, getRagStatus, rebuildRagIndex, RagAskResponse } from '@/lib/api/rag';

export function useRag() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (question: string): Promise<RagAskResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await askRag({ question });
      return res;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const rebuild = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await rebuildRagIndex();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const status = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await getRagStatus();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, ask, rebuild, status };
}



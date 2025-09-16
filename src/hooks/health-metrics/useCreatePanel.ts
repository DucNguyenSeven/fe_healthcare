"use client";

import { useCallback, useState } from 'react';
import { HealthMetricsApi, type CreateHealthMetricPanelRequest } from '@/lib/api/health-metrics';

export function useCreateHealthMetricPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPanel = useCallback(async (payload: CreateHealthMetricPanelRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await HealthMetricsApi.createPanel(payload);
      return res?.data ?? res;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Đã xảy ra lỗi';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createPanel, isLoading, error };
}

export type { CreateHealthMetricPanelRequest };



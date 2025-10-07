import { useEffect, useRef } from 'react';
import { useWebSocketAppointment } from '@/contexts/WebSocketAppointmentContext';

/**
 * Hook to automatically refetch appointments when socket events occur
 * @param refetchFn - Function to call when appointments should be refetched
 * @param enabled - Whether to enable the socket listener (default: true)
 */
export const useAppointmentSocket = (
  refetchFn: () => void,
  enabled: boolean = true
) => {
  const { onAppointmentUpdate, connectionStatus } = useWebSocketAppointment();
  const refetchFnRef = useRef(refetchFn);

  // Update ref when refetchFn changes
  useEffect(() => {
    refetchFnRef.current = refetchFn;
  }, [refetchFn]);

  // Subscribe to appointment updates
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = onAppointmentUpdate(() => {
      // Call the refetch function when any appointment event occurs
      refetchFnRef.current();
    });

    return unsubscribe;
  }, [enabled, onAppointmentUpdate]);

  return {
    connectionStatus
  };
};

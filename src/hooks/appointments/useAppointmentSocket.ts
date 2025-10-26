import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useWebSocketAppointment } from '@/contexts/WebSocketAppointmentContext';

/**
 * Simple debounce implementation
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

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
  const isFetchingRef = useRef(false);

  // Update ref when refetchFn changes
  useEffect(() => {
    refetchFnRef.current = refetchFn;
  }, [refetchFn]);

  // Create debounced refetch function (800ms delay to prevent spam)
  const debouncedRefetch = useMemo(() => {
    return debounce(() => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        console.log('🔍 [useAppointmentSocket] Fetch already in progress, skipping');
        return;
      }

      console.log('🔍 [useAppointmentSocket] Executing debounced refetch');
      try {
        isFetchingRef.current = true;
        refetchFnRef.current();
        console.log('✅ [useAppointmentSocket] Refetch function executed successfully');

        // Reset fetch flag after a short delay
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 1000);
      } catch (error) {
        console.error('❌ [useAppointmentSocket] Error executing refetch function:', error);
        isFetchingRef.current = false;
      }
    }, 800); // 800ms debounce delay
  }, []);

  // Subscribe to appointment updates
  useEffect(() => {
    if (!enabled) {
      console.log('🔍 [useAppointmentSocket] Hook disabled, not subscribing');
      return;
    }

    console.log('🔍 [useAppointmentSocket] Subscribing to appointment updates');

    const unsubscribe = onAppointmentUpdate(() => {
      console.log('🔍 [useAppointmentSocket] Appointment update event received, calling debounced refetch');
      // Call debounced refetch to prevent rapid successive calls
      debouncedRefetch();
    });

    console.log('✅ [useAppointmentSocket] Successfully subscribed to appointment updates');

    return () => {
      console.log('🔍 [useAppointmentSocket] Unsubscribing from appointment updates');
      unsubscribe();
    };
  }, [enabled, onAppointmentUpdate, debouncedRefetch]);

  return {
    connectionStatus
  };
};

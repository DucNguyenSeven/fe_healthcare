import { useEffect, useRef, useCallback, useMemo } from "react";
import { useWebSocketAppointment } from "@/contexts/WebSocketAppointmentContext";

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
        return;
      }

      try {
        isFetchingRef.current = true;
        refetchFnRef.current();

        // Reset fetch flag after a short delay
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 1000);
      } catch (error) {
        console.error(
          "❌ [useAppointmentSocket] Error executing refetch function:",
          error
        );
        isFetchingRef.current = false;
      }
    }, 800); // 800ms debounce delay
  }, []);

  // Subscribe to appointment updates
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsubscribe = onAppointmentUpdate(() => {
      // Call debounced refetch to prevent rapid successive calls
      debouncedRefetch();
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, onAppointmentUpdate, debouncedRefetch]);

  return {
    connectionStatus,
  };
};

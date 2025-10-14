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
    if (!enabled) {
      console.log('🔍 [useAppointmentSocket] Hook disabled, not subscribing');
      return;
    }

    console.log('🔍 [useAppointmentSocket] Subscribing to appointment updates');

    const unsubscribe = onAppointmentUpdate(() => {
      console.log('🔍 [useAppointmentSocket] Appointment update event received, calling refetch function');
      // Call the refetch function when any appointment event occurs
      try {
        refetchFnRef.current();
        console.log('✅ [useAppointmentSocket] Refetch function executed successfully');
      } catch (error) {
        console.error('❌ [useAppointmentSocket] Error executing refetch function:', error);
      }
    });

    console.log('✅ [useAppointmentSocket] Successfully subscribed to appointment updates');

    return () => {
      console.log('🔍 [useAppointmentSocket] Unsubscribing from appointment updates');
      unsubscribe();
    };
  }, [enabled, onAppointmentUpdate]);

  return {
    connectionStatus
  };
};

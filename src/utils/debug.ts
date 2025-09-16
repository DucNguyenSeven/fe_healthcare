// Debug utility for doctor schedule
export const DEBUG_DOCTOR_SCHEDULE = process.env.NODE_ENV === 'development' ||
  localStorage.getItem('DEBUG_DOCTOR_SCHEDULE') === 'true';

export const debugLog = (category: string, message: string, data?: any) => {
  if (!DEBUG_DOCTOR_SCHEDULE) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${category}]`;

  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

// Quick access functions for different categories
export const debugScheduleApi = (message: string, data?: any) =>
  debugLog('SCHEDULE-API', message, data);

export const debugScheduleHook = (message: string, data?: any) =>
  debugLog('SCHEDULE-HOOK', message, data);

export const debugScheduleModal = (message: string, data?: any) =>
  debugLog('SCHEDULE-MODAL', message, data);

export const debugScheduleMapping = (message: string, data?: any) =>
  debugLog('SCHEDULE-MAPPING', message, data);

// Enable/disable debug from console
if (typeof window !== 'undefined') {
  (window as any).enableScheduleDebug = () => {
    localStorage.setItem('DEBUG_DOCTOR_SCHEDULE', 'true');
    console.log('✅ Doctor Schedule Debug ENABLED. Refresh page to see logs.');
  };

  (window as any).disableScheduleDebug = () => {
    localStorage.removeItem('DEBUG_DOCTOR_SCHEDULE');
    console.log('❌ Doctor Schedule Debug DISABLED. Refresh page to hide logs.');
  };
}
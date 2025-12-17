/**
 * Time Slot Utility Functions
 *
 * Provides utilities for filtering and validating time slots for appointment booking,
 * with special handling for same-day appointments to prevent booking past time slots.
 */

/**
 * Filters out time slots that have already passed for same-day appointments
 *
 * @param availableSlots - Array of time slots from API (e.g., ["08:00", "09:00", ...])
 * @param selectedDate - The appointment date in YYYY-MM-DD format
 * @param bufferMinutes - Buffer time in minutes to add safety margin (default: 30)
 * @returns Filtered array with only future time slots for today, or all slots for future dates
 *
 * @example
 * // Current time: 15:44, selected date: today
 * filterPastTimeSlots(["08:00", "16:00", "16:30"], "2025-12-17", 30)
 * // Returns: ["16:30"] (16:00 is disabled because 15:44 + 30 min buffer = 16:14)
 *
 * @example
 * // Current time: 15:44, selected date: tomorrow
 * filterPastTimeSlots(["08:00", "16:00", "16:30"], "2025-12-18", 30)
 * // Returns: ["08:00", "16:00", "16:30"] (all slots, no filtering for future dates)
 */
export const filterPastTimeSlots = (
  availableSlots: string[],
  selectedDate: string,
  bufferMinutes: number = 30
): string[] => {
  try {
    // Get current time in Vietnam timezone
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    // Parse selected date (YYYY-MM-DD format)
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const today = new Date(vietnamTime.toDateString());

    // If selected date is not today, return all slots (no filtering for future dates)
    if (selectedDateObj.getTime() !== today.getTime()) {
      return availableSlots;
    }

    // For same-day appointments, filter out past slots with buffer
    const currentHour = vietnamTime.getHours();
    const currentMinute = vietnamTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute + bufferMinutes;

    return availableSlots.filter((timeString) => {
      const [hourStr, minuteStr] = timeString.split(':');
      const slotHour = parseInt(hourStr, 10);
      const slotMinute = parseInt(minuteStr, 10);
      const slotTotalMinutes = slotHour * 60 + slotMinute;

      return slotTotalMinutes >= currentTotalMinutes;
    });
  } catch (error) {
    // Fallback: return all slots if any error occurs
    console.error('Error filtering past time slots:', error);
    return availableSlots;
  }
};

/**
 * Checks if a specific time slot is in the past for same-day appointments
 * Useful for determining UI states (showing tooltips, different styling)
 *
 * @param timeSlot - Time slot string (e.g., "08:00")
 * @param selectedDate - The appointment date in YYYY-MM-DD format
 * @param bufferMinutes - Buffer time in minutes (default: 30)
 * @returns true if the slot is in the past, false otherwise
 *
 * @example
 * // Current time: 15:44, selected date: today
 * isTimeSlotPast("15:30", "2025-12-17", 30) // Returns: true (15:30 < 16:14)
 * isTimeSlotPast("16:30", "2025-12-17", 30) // Returns: false (16:30 >= 16:14)
 *
 * @example
 * // Current time: 15:44, selected date: tomorrow
 * isTimeSlotPast("08:00", "2025-12-18", 30) // Returns: false (not today)
 */
export const isTimeSlotPast = (
  timeSlot: string,
  selectedDate: string,
  bufferMinutes: number = 30
): boolean => {
  try {
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const today = new Date(vietnamTime.toDateString());

    // If not today, slot is not past
    if (selectedDateObj.getTime() !== today.getTime()) {
      return false;
    }

    const currentHour = vietnamTime.getHours();
    const currentMinute = vietnamTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute + bufferMinutes;

    const [hourStr, minuteStr] = timeSlot.split(':');
    const slotHour = parseInt(hourStr, 10);
    const slotMinute = parseInt(minuteStr, 10);
    const slotTotalMinutes = slotHour * 60 + slotMinute;

    return slotTotalMinutes < currentTotalMinutes;
  } catch (error) {
    // Fallback: assume not past if any error occurs
    console.error('Error checking if time slot is past:', error);
    return false;
  }
};

/**
 * Gets a human-readable reason why a time slot is disabled
 *
 * @param timeSlot - Time slot string (e.g., "08:00")
 * @param isAvailableFromAPI - Whether the slot is available according to API
 * @param isPast - Whether the slot is in the past (from isTimeSlotPast)
 * @returns Reason string in Vietnamese, or null if slot is available
 *
 * @example
 * getTimeSlotDisabledReason("08:00", false, true) // Returns: "Đã qua giờ"
 * getTimeSlotDisabledReason("08:00", false, false) // Returns: "Bác sĩ không có lịch"
 * getTimeSlotDisabledReason("08:00", true, false) // Returns: null (slot is available)
 */
export const getTimeSlotDisabledReason = (
  timeSlot: string,
  isAvailableFromAPI: boolean,
  isPast: boolean
): string | null => {
  if (isPast) {
    return "Đã qua giờ";
  }
  if (!isAvailableFromAPI) {
    return "Bác sĩ không có lịch";
  }
  return null;
};

// Test file để kiểm tra API booking appointment
import { bookingAppointment } from './index';

/**
 * Test function để kiểm tra API booking appointment
 * Gọi function này từ console để test
 */
export const testBookingAppointment = async () => {
  console.log('🧪 Testing Booking Appointment API...');
  
  try {
    const testBookingData = {
      patientId: 'patient-123',
      scheduleId: 'schedule-456',
      doctorId: 'doctor-789',
      symptoms: 'Đau đầu, sốt nhẹ',
      note: 'Bệnh nhân có tiền sử dị ứng thuốc',
      slotId: 16,
      consultationType: 'ONLINE_CONSULTATION' as const,
      addressDetail: '123 Đường ABC, Quận 1, TP.HCM'
    };
    
    console.log('📝 Test booking data:', testBookingData);
    
    const response = await bookingAppointment(testBookingData);
    
    console.log('✅ Booking response:', response);
    
    if (response.status === 'success' && response.data) {
      console.log('🎉 Appointment booked successfully!');
      console.log('📋 Appointment details:', response.data);
    } else {
      console.log('❌ Booking failed:', response.message);
    }
    
  } catch (error) {
    console.error('❌ Booking API Test failed:', error);
  }
};

// Auto-run test khi import (chỉ trong development)
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Auto-running Booking Appointment API test...');
  // Uncomment để auto-run test
  // testBookingAppointment();
}

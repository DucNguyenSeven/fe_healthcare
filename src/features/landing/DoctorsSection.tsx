'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthenticatedBooking } from '@/hooks/useAuthenticatedBooking';
const doctors = [{
  id: 'doctor-1',
  name: 'BS. Nguyễn Văn An',
  specialty: 'Tim mạch',
  description: 'Chuyên gia tim mạch với hơn 15 năm kinh nghiệm',
  experience: '15+ năm kinh nghiệm',
  avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face'
}, {
  id: 'doctor-2',
  name: 'BS. Trần Thị Bình',
  specialty: 'Nội khoa',
  description: 'Bác sĩ nội khoa giàu kinh nghiệm trong điều trị',
  experience: '12+ năm kinh nghiệm',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
}, {
  id: 'doctor-3',
  name: 'BS. Lê Minh Cường',
  specialty: 'Ngoại khoa',
  description: 'Chuyên gia phẫu thuật với nhiều ca thành công',
  experience: '18+ năm kinh nghiệm',
  avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face'
}] as any[];

// @component: DoctorsSection
export const DoctorsSection = () => {
  const { handleBookingClick } = useAuthenticatedBooking();

  // @return
  return <section id="doctors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span>Gặp gỡ đội ngũ bác sĩ chuyên môn</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <span>Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp sẽ mang đến cho bạn dịch vụ chăm sóc sức khỏe tốt nhất</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map(doctor => <motion.div key={doctor.id} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <img src={doctor.avatar} alt={`Ảnh của ${doctor.name}`} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <span>{doctor.name}</span>
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  <span>{doctor.specialty}</span>
                </p>
                <p className="text-gray-600 mb-4">
                  <span>{doctor.description}</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  <span>{doctor.experience}</span>
                </p>
                <button
                  onClick={() => handleBookingClick(doctor)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span>Đặt lịch khám</span>
                </button>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Clock, Users, Award, Phone } from 'lucide-react';
const services = [{
  id: 'service-1',
  icon: Heart,
  title: 'Khám tim mạch',
  description: 'Chẩn đoán và điều trị các bệnh lý tim mạch với công nghệ hiện đại'
}, {
  id: 'service-2',
  icon: Shield,
  title: 'Khám tổng quát',
  description: 'Kiểm tra sức khỏe toàn diện với đội ngũ bác sĩ chuyên nghiệp'
}, {
  id: 'service-3',
  icon: Clock,
  title: 'Cấp cứu 24/7',
  description: 'Dịch vụ cấp cứu và chăm sóc y tế 24 giờ mỗi ngày'
}, {
  id: 'service-4',
  icon: Users,
  title: 'Tư vấn trực tuyến',
  description: 'Tư vấn sức khỏe từ xa với các chuyên gia y tế'
}, {
  id: 'service-5',
  icon: Award,
  title: 'Chăm sóc đặc biệt',
  description: 'Dịch vụ chăm sóc cao cấp với tiêu chuẩn quốc tế'
}, {
  id: 'service-6',
  icon: Phone,
  title: 'Hỗ trợ 24/7',
  description: 'Đội ngũ hỗ trợ khách hàng luôn sẵn sàng phục vụ'
}] as any[];

// @component: ServicesSection
export const ServicesSection = () => {
  // @return
  return <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span>Dịch vụ của chúng tôi</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <span>Chúng tôi cung cấp đầy đủ các dịch vụ y tế chất lượng cao với đội ngũ chuyên gia giàu kinh nghiệm</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => {
          const IconComponent = service.icon;
          return <motion.div key={service.id} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  <span>{service.title}</span>
                </h3>
                <p className="text-gray-600">
                  <span>{service.description}</span>
                </p>
              </motion.div>;
        })}
        </div>
      </div>
    </section>;
};
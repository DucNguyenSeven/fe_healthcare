import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Shield, Clock, Users, Award, Phone, Star, ChevronDown, ChevronUp, Facebook, Twitter, Instagram, Mail, MapPin } from 'lucide-react';
import { HealthcareLogo } from '../../shared/ui/HealthcareLogo';
import { MobileSlider } from './MobileSlider';
const services = [{
  id: 'service-1',
  icon: Heart,
  title: 'Hồ sơ bệnh án',
  description: 'Quản lý hồ sơ bệnh án điện tử an toàn và tiện lợi'
}, {
  id: 'service-2',
  icon: Shield,
  title: 'Đặt lịch hẹn',
  description: 'Đặt lịch khám bệnh dễ dàng với bác sĩ chuyên khoa'
}, {
  id: 'service-3',
  icon: Clock,
  title: 'Theo dõi sức khỏe',
  description: 'Theo dõi các chỉ số sức khỏe quan trọng hàng ngày'
}, {
  id: 'service-4',
  icon: Users,
  title: 'Quản lý thuốc',
  description: 'Quản lý đơn thuốc và nhắc nhở uống thuốc đúng giờ'
}, {
  id: 'service-5',
  icon: Award,
  title: 'Giáo dục sức khỏe',
  description: 'Tài liệu và hướng dẫn chăm sóc sức khỏe từ chuyên gia'
}, {
  id: 'service-6',
  icon: Phone,
  title: 'Hỗ trợ cộng đồng',
  description: 'Kết nối với cộng đồng bệnh nhân và chia sẻ kinh nghiệm'
}] as any[];
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
const testimonials = [{
  id: 'testimonial-1',
  name: 'Nguyễn Thị Mai',
  rating: 5,
  review: 'Dịch vụ tuyệt vời, bác sĩ rất tận tâm và chuyên nghiệp. Tôi rất hài lòng với Healthcare+.',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
}, {
  id: 'testimonial-2',
  name: 'Trần Văn Hùng',
  rating: 5,
  review: 'Hệ thống đặt lịch rất tiện lợi, không phải chờ đợi lâu. Rất khuyến khích mọi người sử dụng.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
}, {
  id: 'testimonial-3',
  name: 'Lê Thị Hoa',
  rating: 5,
  review: 'Cơ sở vật chất hiện đại, đội ngũ y tá chu đáo. Cảm ơn Healthcare+ đã chăm sóc gia đình tôi.',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
}] as any[];
const faqs = [{
  id: 'faq-1',
  question: 'Làm thế nào để đặt lịch khám?',
  answer: 'Bạn có thể đặt lịch khám qua website, ứng dụng di động hoặc gọi điện trực tiếp đến hotline của chúng tôi.'
}, {
  id: 'faq-2',
  question: 'Healthcare+ có những dịch vụ gì?',
  answer: 'Chúng tôi cung cấp đầy đủ các dịch vụ y tế từ khám tổng quát, chuyên khoa đến cấp cứu 24/7.'
}, {
  id: 'faq-3',
  question: 'Chi phí khám chữa bệnh như thế nào?',
  answer: 'Chi phí được niêm yết công khai và minh bạch. Chúng tôi chấp nhận thanh toán bằng tiền mặt và thẻ.'
}, {
  id: 'faq-4',
  question: 'Có hỗ trợ bảo hiểm y tế không?',
  answer: 'Có, chúng tôi hỗ trợ thanh toán qua bảo hiểm y tế xã hội và các loại bảo hiểm tư nhân.'
}] as any[];
interface HealthcarePlusLandingPageProps {
  onLoginClick?: () => void;
}
export const HealthcarePlusLandingPage = ({
  onLoginClick
}: HealthcarePlusLandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };
  const handleBackdropClick = () => {
    setIsMenuOpen(false);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false);
    }
  };
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);
  return <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <HealthcareLogo size="md" className="mr-3" />
              <span className="text-xl font-bold text-blue-600">Healthcare+</span>
            </div>

            {/* Desktop Menu - Hidden below 1200px */}
            <div className="hidden xl:block">
              <div className="flex items-center space-x-8">
                <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md">
                  <span>Trang chủ</span>
                </button>
                <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md">
                  <span>Dịch vụ</span>
                </button>
                <button onClick={() => scrollToSection('doctors')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md">
                  <span>Bác sĩ</span>
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md">
                  <span>Đánh giá</span>
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md">
                  <span>Câu hỏi thường gặp</span>
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md">
                  <span>Liên hệ</span>
                </button>
              </div>
            </div>

            {/* Desktop Auth Buttons - Hidden below 1200px */}
            <div className="hidden xl:flex items-center space-x-4">
              <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                <span>Đăng ký</span>
              </button>
              <button onClick={onLoginClick} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                <span>Đăng nhập</span>
              </button>
            </div>

            {/* Hamburger Button - Visible below 1200px */}
            <div className="xl:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md" style={{
              minWidth: '44px',
              minHeight: '44px'
            }} aria-label="Toggle menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Drawer */}
      <AnimatePresence>
        {isMenuOpen && <div className="fixed inset-0 z-50 xl:hidden">
            {/* Backdrop */}
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.18
        }} className="absolute inset-0 bg-black/40" onClick={handleBackdropClick} />
            
            {/* Drawer */}
            <motion.div initial={{
          x: '-100%'
        }} animate={{
          x: 0
        }} exit={{
          x: '-100%'
        }} transition={{
          duration: 0.24,
          ease: [0.22, 1, 0.36, 1]
        }} className="absolute left-0 top-0 h-full bg-white shadow-2xl flex flex-col w-[88%] md:w-80 rounded-r-2xl">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <HealthcareLogo size="md" className="mr-3" />
                  <span className="text-xl font-bold text-blue-600">Healthcare+</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md" style={{
              minWidth: '44px',
              minHeight: '44px'
            }} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-6 py-6">
                <nav className="space-y-6">
                  <button onClick={() => scrollToSection('home')} className="block w-full text-left text-gray-900 hover:text-blue-600 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-2" style={{
                minHeight: '44px'
              }}>
                    <span>Trang chủ</span>
                  </button>
                  <button onClick={() => scrollToSection('services')} className="block w-full text-left text-gray-900 hover:text-blue-600 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-2" style={{
                minHeight: '44px'
              }}>
                    <span>Dịch vụ</span>
                  </button>
                  <button onClick={() => scrollToSection('doctors')} className="block w-full text-left text-gray-900 hover:text-blue-600 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-2" style={{
                minHeight: '44px'
              }}>
                    <span>Bác sĩ</span>
                  </button>
                  <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left text-gray-900 hover:text-blue-600 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-2" style={{
                minHeight: '44px'
              }}>
                    <span>Đánh giá</span>
                  </button>
                  <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-gray-900 hover:text-blue-600 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-2" style={{
                minHeight: '44px'
              }}>
                    <span>Câu hỏi thường gặp</span>
                  </button>
                  <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-gray-900 hover:text-blue-600 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-2" style={{
                minHeight: '44px'
              }}>
                    <span>Liên hệ</span>
                  </button>
                </nav>
              </div>

              {/* CTA Buttons - Pinned to bottom */}
              <div className="p-5 border-t border-gray-200 bg-white">
                <div className="space-y-3">
                  <button className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-xl text-base font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <span>Đăng ký</span>
                  </button>
                  <button onClick={onLoginClick} className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <span>Đăng nhập</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-4xl md:text-6xl font-bold mb-6">
            <span>Hệ thống quản lý sức khỏe thận</span>
          </motion.h1>
          <motion.h2 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-2xl md:text-3xl font-semibold mb-4 text-blue-200">
            <span>Healthcare+</span>
          </motion.h2>
          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            <span>Chúng tôi đồng hành cùng bạn trong hành trình kiểm soát bệnh thận với công nghệ hiện đại và đội ngũ y tế chuyên nghiệp.</span>
          </motion.p>
          <motion.button onClick={onLoginClick} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
            <span>Đăng nhập</span>
          </motion.button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span>Dịch vụ của chúng tôi</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <span>Chúng tôi cung cấp đầy đủ các dịch vụ y tế chất lượng cao với đội ngũ chuyên gia giàu kinh nghiệm</span>
            </p>
          </div>
          
          {/* Desktop/Tablet Grid - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Mobile Slider - Visible only on mobile */}
          <div className="md:hidden">
            <MobileSlider>
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
            </MobileSlider>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span>Gặp gỡ đội ngũ bác sĩ chuyên môn</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <span>Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp sẽ mang đến cho bạn dịch vụ chăm sóc sức khỏe tốt nhất</span>
            </p>
          </div>
          
          {/* Desktop/Tablet Grid - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <span>Đặt lịch khám</span>
                  </button>
                </div>
              </motion.div>)}
          </div>

          {/* Mobile Slider - Visible only on mobile */}
          <div className="md:hidden">
            <MobileSlider>
              {doctors.map(doctor => <motion.div key={doctor.id} initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <img src={doctor.avatar} alt={`Ảnh của ${doctor.name}`} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover" loading="lazy" />
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
                    <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                      <span>Đặt lịch khám</span>
                    </button>
                  </div>
                </motion.div>)}
            </MobileSlider>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span>Phản hồi từ bệnh nhân</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <span>Những chia sẻ chân thực từ bệnh nhân đã tin tưởng và sử dụng dịch vụ của Healthcare+</span>
            </p>
          </div>
          
          {/* Desktop/Tablet Grid - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map(testimonial => <motion.div key={testimonial.id} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <img src={testimonial.avatar} alt={`Ảnh của ${testimonial.name}`} className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <span>{testimonial.name}</span>
                    </h4>
                    <div className="flex">
                      {Array.from({
                    length: testimonial.rating
                  }).map((_, index) => <Star key={`star-${testimonial.id}-${index}`} className="h-4 w-4 text-yellow-400 fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  <span>"{testimonial.review}"</span>
                </p>
              </motion.div>)}
          </div>

          {/* Mobile Slider - Visible only on mobile */}
          <div className="md:hidden">
            <MobileSlider>
              {testimonials.map(testimonial => <motion.div key={testimonial.id} initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }} className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-4">
                    <img src={testimonial.avatar} alt={`Ảnh của ${testimonial.name}`} className="w-12 h-12 rounded-full mr-4 object-cover" loading="lazy" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        <span>{testimonial.name}</span>
                      </h4>
                      <div className="flex">
                        {Array.from({
                      length: testimonial.rating
                    }).map((_, index) => <Star key={`star-${testimonial.id}-${index}`} className="h-4 w-4 text-yellow-400 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    <span>"{testimonial.review}"</span>
                  </p>
                </motion.div>)}
            </MobileSlider>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span>Câu hỏi thường gặp</span>
            </h2>
            <p className="text-lg text-gray-600">
              <span>Những câu hỏi phổ biến về dịch vụ của Healthcare+</span>
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map(faq => <div key={faq.id} className="border border-gray-200 rounded-2xl">
                <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === faq.id ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openFaq === faq.id && <div className="px-8 pb-6">
                    <p className="text-gray-600">
                      <span>{faq.answer}</span>
                    </p>
                  </div>}
              </div>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <HealthcareLogo size="md" className="mr-3" />
                <span className="text-xl font-bold">Healthcare+</span>
              </div>
              <p className="text-gray-400 mb-6">
                <span>Chăm sóc sức khỏe toàn diện với công nghệ hiện đại và đội ngũ y tế chuyên nghiệp.</span>
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">
                <span>Liên kết</span>
              </h3>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"><span>Trang chủ</span></button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"><span>Tính năng</span></button></li>
                <li><button onClick={() => scrollToSection('doctors')} className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"><span>Bác sĩ</span></button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"><span>Phản hồi</span></button></li>
                <li><button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"><span>Câu hỏi thường gặp</span></button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">
                <span>Liên hệ</span>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-400">1900 1234</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-400">info@healthcareplus.vn</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-400 mr-3 mt-1" />
                  <span className="text-gray-400">123 Đường ABC, Quận 1, TP.HCM</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">
                <span>Bắt đầu ngay</span>
              </h3>
              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900">
                  <span>Đăng ký</span>
                </button>
                <button onClick={onLoginClick} className="w-full border border-gray-600 text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900">
                  <span>Đăng nhập</span>
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              <span>© 2024 Healthcare+. Tất cả quyền được bảo lưu.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
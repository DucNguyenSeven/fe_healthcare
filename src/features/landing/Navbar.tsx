import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { HealthcareNavbarLogo } from '../../shared/ui/HealthcareNavbarLogo';
interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
}

// @component: Navbar
export const Navbar = ({
  scrollToSection
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // @return
  return <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <HealthcareNavbarLogo />
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => handleNavClick('home')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                <span>Trang chủ</span>
              </button>
              <button onClick={() => handleNavClick('services')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                <span>Dịch vụ</span>
              </button>
              <button onClick={() => handleNavClick('doctors')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                <span>Bác sĩ</span>
              </button>
              <button onClick={() => handleNavClick('testimonials')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                <span>Đánh giá</span>
              </button>
              <button onClick={() => handleNavClick('faq')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                <span>Câu hỏi thường gặp</span>
              </button>
              <button onClick={() => handleNavClick('contact')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                <span>Liên hệ</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                <span>Đăng ký</span>
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <span>Đăng nhập</span>
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 hover:text-blue-600 p-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button onClick={() => handleNavClick('home')} className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left">
              <span>Trang chủ</span>
            </button>
            <button onClick={() => handleNavClick('services')} className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left">
              <span>Dịch vụ</span>
            </button>
            <button onClick={() => handleNavClick('doctors')} className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left">
              <span>Bác sĩ</span>
            </button>
            <button onClick={() => handleNavClick('testimonials')} className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left">
              <span>Đánh giá</span>
            </button>
            <button onClick={() => handleNavClick('faq')} className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left">
              <span>Câu hỏi thường gặp</span>
            </button>
            <button onClick={() => handleNavClick('contact')} className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 w-full text-left">
              <span>Liên hệ</span>
            </button>
            <div className="px-3 py-2 space-y-2">
              <button className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                <span>Đăng ký</span>
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <span>Đăng nhập</span>
              </button>
            </div>
          </div>
        </div>}
    </nav>;
};
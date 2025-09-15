"use client";

import React, { useState } from 'react';
import { AuthPageLayout } from './AuthPageLayout';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { OTPForm } from './OTPForm';
interface AuthPagesProps {
  onBackToHome?: () => void;
  onLoginSuccess?: (email: string) => void;
}
type AuthPageType = 'login' | 'register' | 'forgot-password' | 'otp';
const healthcareQuotes = {
  login: {
    text: "Yên tâm nhé, chúng tôi luôn ở bên khi bạn cần",
    author: "Healthcare+"
  },
  register: {
    text: "Đồng hành chăm sóc, sống trọn từng ngày",
    author: "Healthcare+"
  },
  'forgot-password': {
    text: "Sức khỏe hôm nay, hạnh phúc ngày mai",
    author: "Healthcare+"
  },
  otp: {
    text: "Niềm tin của bạn – Sứ mệnh của chúng tôi",
    author: "Healthcare+"
  }
};
export const AuthPages = ({
  onBackToHome,
  onLoginSuccess
}: AuthPagesProps) => {
  const [currentPage, setCurrentPage] = useState<AuthPageType>('login');
  const [userEmail, setUserEmail] = useState('');
  const getCurrentQuote = () => {
    return healthcareQuotes[currentPage];
  };
  const quote = getCurrentQuote();
  const handlePageChange = (page: AuthPageType, email?: string) => {
    setCurrentPage(page);
    if (email) {
      setUserEmail(email);
    }
  };
  const renderCurrentForm = () => {
    switch (currentPage) {
      case 'login':
        return <LoginForm onNavigate={handlePageChange} onLoginSuccess={onLoginSuccess} />;
      case 'register':
        return <RegisterForm onNavigate={handlePageChange} />;
      case 'forgot-password':
        return <ForgotPasswordForm onNavigate={handlePageChange} />;
      case 'otp':
        return <OTPForm onNavigate={handlePageChange} userEmail={userEmail} />;
      default:
        return <LoginForm onNavigate={handlePageChange} onLoginSuccess={onLoginSuccess} />;
    }
  };

  // Use a healthcare-themed illustration placeholder
  const healthcareIllustration = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  return <AuthPageLayout quote={quote} illustration={healthcareIllustration}>
      {renderCurrentForm()}
    </AuthPageLayout>;
};
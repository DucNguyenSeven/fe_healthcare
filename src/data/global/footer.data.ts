export interface FooterLink {
    name: string;
    href: string;
  }
  
  export interface ContactInfo {
    icon: string;
    text: string;
    href: string;
  }
  
  export interface SocialLink {
    name: string;
    icon: string;
    href: string;
    ariaLabel: string;
  }
  
  export const footerLinks: FooterLink[] = [
    { name: 'Trang chủ', href: '#home' },
    { name: 'Tính năng', href: '#features' },
    { name: 'Bác sĩ', href: '#doctors' },
    { name: 'Phản hồi', href: '#feedback' },
    { name: 'Câu hỏi thường gặp', href: '#faq' },
  ];
  
  export const contactInfo: ContactInfo[] = [
    {
      icon: 'phone',
      text: '+84 123 456 789',
      href: 'tel:+84123456789',
    },
    {
      icon: 'email',
      text: 'info@healthcare.com',
      href: 'mailto:info@healthcare.com',
    },
    {
      icon: 'location_on',
      text: '123 Đường ABC, Quận 1, TP.HCM',
      href: '#',
    },
  ];
  
  export const socialLinks: SocialLink[] = [
    {
      name: 'Facebook',
      icon: 'facebook',
      href: 'https://facebook.com',
      ariaLabel: 'Theo dõi chúng tôi trên Facebook',
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      href: 'https://twitter.com',
      ariaLabel: 'Theo dõi chúng tôi trên Twitter',
    },
    {
      name: 'Instagram',
      icon: 'instagram',
      href: 'https://instagram.com',
      ariaLabel: 'Theo dõi chúng tôi trên Instagram',
    },
  ];
  
  export const bottomBarLinks: FooterLink[] = [
    { name: 'Chính sách bảo mật', href: '/privacy' },
    { name: 'Gửi phản hồi', href: '/feedback' },
    { name: 'Đăng ký tư vấn', href: '/consultation' },
  ]; 
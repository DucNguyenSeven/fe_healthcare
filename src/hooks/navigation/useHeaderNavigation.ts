import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  hash: string;
  path?: string;
}

export const useHeaderNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Trang chủ', hash: '#home' },
    { label: 'Dịch vụ', hash: '#services' },
    { label: 'Bác sĩ', hash: '#doctors' },
    { label: 'Đánh giá', hash: '#reviews' },
    { label: 'Câu hỏi thường gặp', hash: '#faq' },
    { label: 'Liên hệ', hash: '#contact' },
  ];

  const handleScroll = (id: string): void => {
    const element = document.getElementById(id);
    
    if (!element) {
      return;
    }
    
    // Use scrollIntoView instead of scrollTo for better compatibility
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
    
    // Alternative: manually adjust scroll position with offset
    setTimeout(() => {
      const headerOffset = window.innerWidth <= 768 ? 72 : 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleNavigation = (item: NavItem): void => {
    if (item.hash) {
      if (pathname === '/') {
        handleScroll(item.hash.substring(1));
      } else {
        router.push('/');
        setTimeout(() => {
          handleScroll(item.hash.substring(1));
        }, 100);
      }
    } else {
      router.push(item.path || '/');
    }
  };

  const handleRegister = (): void => {
    router.push('/register');
  };

  const handleLogin = (): void => {
    router.push('/login');
  };

  return {
    navItems,
    handleNavigation,
    handleRegister,
    handleLogin,
  };
}; 
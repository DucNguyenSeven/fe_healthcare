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
    if (!element) return;
    
    const headerOffset = window.innerWidth <= 768 ? 72 : 80;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const handleNavigation = (item: NavItem): void => {
    if (item.hash) {
      if (pathname === '/') {
        handleScroll(item.hash.substring(1)); // Remove # from hash
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
    console.log('Register button clicked');
    router.push('/register');
  };

  const handleLogin = (): void => {
    console.log('Login button clicked');
    router.push('/login');
  };

  return {
    navItems,
    handleNavigation,
    handleRegister,
    handleLogin,
  };
}; 
// Header component types
export interface NavItem {
  label: string;
  hash: string;
}

export interface HeaderProps {
  className?: string;
}

export interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

export interface HeaderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onNavItemClick: (item: NavItem) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onRegister: () => void;
}

export interface HeaderToolbarProps {
  navItems: NavItem[];
  onDrawerToggle: () => void;
  isAuthenticated: boolean;
  user: any;
  onLogin: () => void;
  onRegister: () => void;
  onUserMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

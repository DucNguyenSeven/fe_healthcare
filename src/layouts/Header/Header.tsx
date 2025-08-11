"use client";

import React, { useState } from 'react';
import {
  AppBar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useHeaderNavigation } from '../../hooks/navigation';
import { useAuth } from '../../hooks';
import { HeaderToolbar } from './HeaderToolbar';
import { HeaderDrawer } from './HeaderDrawer';
import { UserMenu } from './UserMenu';
import { HeaderProps, NavItem } from './types';

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isDrawer = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Use navigation hook
  const { navItems, handleRegister, handleLogin } = useHeaderNavigation();
  
  // Use auth hook
  const { isAuthenticated, user, logout } = useAuth();

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = (): void => {
    setUserMenuAnchor(null);
  };

  const handleLogout = (): void => {
    handleUserMenuClose();
    logout();
  };

  const handleNavWithDrawerClose = (item: NavItem): void => {
    setMobileOpen(false);
    if (item.hash) {
      const element = document.getElementById(item.hash.substring(1));
      if (element) {
        const headerOffset = window.innerWidth <= 768 ? 72 : 80;
        const y = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scroll({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        className={className}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <HeaderToolbar
          navItems={navItems}
          onDrawerToggle={handleDrawerToggle}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onUserMenuOpen={handleUserMenuOpen}
        />
      </AppBar>

      {/* Mobile Drawer */}
      <HeaderDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        onNavItemClick={handleNavWithDrawerClose}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* User Menu */}
      {isAuthenticated && (
        <UserMenu
          user={user}
          onLogout={handleLogout}
          anchorEl={userMenuAnchor}
          isOpen={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
        />
      )}
    </>
  );
};

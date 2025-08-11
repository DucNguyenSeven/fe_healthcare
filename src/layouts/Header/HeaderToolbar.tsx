"use client";

import React from 'react';
import {
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ChatBubbleOutline, AccountCircle } from '@mui/icons-material';
import Link from 'next/link';
import { HeaderToolbarProps, NavItem } from './types';

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  navItems,
  onDrawerToggle,
  isAuthenticated,
  user,
  onLogin,
  onRegister,
  onUserMenuOpen,
}) => {
  const theme = useTheme();
  const isDrawer = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Mobile menu button */}
      {isDrawer && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Logo */}
      <Typography
        variant="h6"
        component={Link}
        href="/"
        sx={{
          flexGrow: 0,
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          fontWeight: 'bold',
          mr: 4,
        }}
      >
        Healthcare+
      </Typography>

      {/* Desktop Navigation */}
      {!isDrawer && (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" spacing={3}>
            {navItems.map((item: NavItem) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => {
                  if (item.hash) {
                    const element = document.getElementById(item.hash.substring(1));
                    if (element) {
                      const headerOffset = 80;
                      const y = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                      window.scroll({ top: y, behavior: 'smooth' });
                    }
                  }
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* Right side actions */}
      <Box sx={{ flexGrow: isDrawer ? 1 : 0, display: 'flex', justifyContent: 'flex-end' }}>
        {isAuthenticated ? (
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Chat button for authenticated users */}
            <IconButton
              component={Link}
              href="/chat"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ChatBubbleOutline />
            </IconButton>

            {/* User menu button */}
            <IconButton
              onClick={onUserMenuOpen}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Stack>
        ) : (
          !isDrawer && (
            <Stack direction="row" spacing={2}>
              <Button
                color="inherit"
                onClick={onLogin}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(5px)',
                  },
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                onClick={onRegister}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  color: 'primary.main',
                  textTransform: 'none',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Đăng ký
              </Button>
            </Stack>
          )
        )}
      </Box>
    </Toolbar>
  );
};

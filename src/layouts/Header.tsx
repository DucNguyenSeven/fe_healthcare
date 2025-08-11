"use client";

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useHeaderNavigation } from '../hooks/navigation';

interface NavItem {
  label: string;
  hash: string;
}

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const theme = useTheme();
  // Use Drawer for screens below lg (≤1023px), desktop layout for lg and up (≥1024px)
  const isDrawer = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Use navigation hook
  const { navItems, handleRegister, handleLogin } = useHeaderNavigation();

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  // Handle navigation with drawer close
  const handleNavWithDrawerClose = (item: NavItem): void => {
    setMobileOpen(false);
    // For hash links, use HashLink's scroll functionality
    if (item.hash) {
      const element = document.getElementById(item.hash.substring(1));
      if (element) {
        const headerOffset = window.innerWidth <= 768 ? 72 : 80;
        const y = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scroll({ top: y, behavior: 'smooth' });
      }
    }
  };

  const drawer = (
    <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 'bold' }}>
        Healthcare+
      </Typography>
      <List>
        {navItems.map((item: NavItem) => (
          <ListItem
            key={item.label}
            onClick={() => handleNavWithDrawerClose(item)}
            sx={{ 
              minHeight: 48,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      {/* CTA Buttons in Drawer */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Stack direction="column" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setMobileOpen(false);
              handleRegister();
            }}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              minHeight: 48,
              fontSize: '1rem',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            Đăng ký
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setMobileOpen(false);
              handleLogin();
            }}
            sx={{
              backgroundColor: 'primary.main',
              minHeight: 48,
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Đăng nhập
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'background.paper',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderRadius: 0,
      }}
    >
      <Box sx={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%' 
      }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          minHeight: { xs: 56, md: 64 },
        }}>
          {/* Brand */}
          <Typography
            variant="h6"
            component="span" // Changed from default 'h6' to 'span' to avoid heading semantics
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem', lg: '1.3rem' },
              flexShrink: 0,
            }}
          >
            Healthcare+
          </Typography>

          {/* Desktop navigation and buttons - only for lg and up (≥1024px) */}
          {!isDrawer && (
            <>
              {/* Navigation Items */}
              <Stack 
                direction="row" 
                spacing={3}
                sx={{ 
                  flexGrow: 0,
                  mx: { lg: 4, xl: 6 },
                }}
              >
                {navItems.map((item: NavItem) => (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.hash}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.hash.substring(1));
                      if (element) {
                        const headerOffset = window.innerWidth <= 768 ? 72 : 80;
                        const y = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                        window.scroll({ top: y, behavior: 'smooth' });
                      }
                    }}
                    color="inherit"
                    sx={{
                      color: 'text.primary',
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap',
                      px: 1.5,
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
              
              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  onClick={handleRegister}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontSize: '0.9rem',
                    px: 3,
                    py: 1,
                    minWidth: '100px',
                    height: '40px',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  Đăng ký
                </Button>
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  sx={{
                    backgroundColor: 'primary.main',
                    fontSize: '0.9rem',
                    px: 3,
                    py: 1,
                    minWidth: '100px',
                    height: '40px',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Đăng nhập
                </Button>
              </Stack>
            </>
          )}

          {/* Hamburger menu for lg and below (≤1023px) */}
          {isDrawer && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Box>

      {/* Drawer for lg and below (≤1023px) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: { xs: 240, md: 320 },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 
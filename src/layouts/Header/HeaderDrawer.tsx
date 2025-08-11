"use client";

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { HeaderDrawerProps, NavItem } from './types';

export const HeaderDrawer: React.FC<HeaderDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  onNavItemClick,
  isAuthenticated,
  onLogin,
  onRegister,
}) => {
  const handleNavItemClick = (item: NavItem) => {
    onNavItemClick(item);
    onClose();
  };

  const drawer = (
    <Box sx={{ 
      textAlign: 'center', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Typography variant="h6" sx={{ 
        my: 2, 
        color: 'primary.main', 
        fontWeight: 'bold' 
      }}>
        Healthcare+
      </Typography>
      
      <List>
        {navItems.map((item: NavItem) => (
          <ListItem
            key={item.label}
            onClick={() => handleNavItemClick(item)}
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
      
      <Divider sx={{ mx: 2, my: 1 }} />
      
      {!isAuthenticated ? (
        <Stack spacing={2} sx={{ px: 2, py: 2, mt: 'auto' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onLogin();
              onClose();
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Đăng nhập
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onRegister();
              onClose();
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Đăng ký
          </Button>
        </Stack>
      ) : (
        <Box sx={{ px: 2, py: 2, mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            Đã đăng nhập
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', lg: 'none' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: 280,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

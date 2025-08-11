"use client";

import React from 'react';
import {
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { 
  Person, 
  LogoutOutlined, 
  AccountCircle 
} from '@mui/icons-material';
import { UserMenuProps } from './types';

interface UserMenuComponentProps extends UserMenuProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserMenu: React.FC<UserMenuComponentProps> = ({
  user,
  onLogout,
  anchorEl,
  isOpen,
  onClose,
}) => {
  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      onClick={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          minWidth: 200,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountCircle />
          </Avatar>
          <Box sx={{ ml: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.email}
            </Typography>
            <Chip 
              label={user?.role || 'User'} 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                height: 20,
                bgcolor: 'primary.50',
                color: 'primary.main',
                fontWeight: 500,
              }} 
            />
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      <MenuItem onClick={onClose} sx={{ py: 1.5 }}>
        <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        Thông tin cá nhân
      </MenuItem>
      
      <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
        <LogoutOutlined fontSize="small" sx={{ mr: 1 }} />
        Đăng xuất
      </MenuItem>
    </Menu>
  );
};
